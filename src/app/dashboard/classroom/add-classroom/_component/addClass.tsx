"use client";

import { DashboardPageTitle } from "@/app/dashboard/_component/page-title";
import { IInput } from "@/components/base/IInput";
import ISwitch from "@/components/base/ISwitch";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { fetchProductApi } from "@/lib/utils/fetchProductApi";
import { toOffsetDateTime } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const classSchema = z.object({
  productType: z.string().min(1, "Tipe produk wajib dipilih"),
  productId: z.string().min(1, "Produk wajib dipilih"),
  publish: z.boolean(),
  publishTime: z.string().min(1, "Publish time wajib diisi"),
  title: z.string().min(1, "Title wajib diisi"),
  isAutoGetCertificate: z.boolean(),
});

type ClassFormValues = z.infer<typeof classSchema>;

type Product = {
  id: number;
  name: string;
  type: string;
  status: string;
  time_start: string;
  category?: {
    id: number;
    name: string;
    created_at: string | null;
  };
};

export type ProductResponse = {
  results: Product[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type ProductApiError = {
  success: false;
  message: string;
  statusCode: number;
};

const productTypeOptions = [
  {
    label: "VIDEO_LEARNING",
    value: "VIDEO_LEARNING",
  },
  {
    label: "BOOTCAMP",
    value: "BOOTCAMP",
  },
];

const pageSize = 5;
const loadingRows = Array.from({ length: pageSize });

const formatDate = (date?: string) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getPaginationPages = (currentPage: number, totalPage: number) => {
  const maxVisiblePage = 5;
  const halfVisiblePage = Math.floor(maxVisiblePage / 2);
  const startPage = Math.max(1, currentPage - halfVisiblePage);
  const endPage = Math.min(totalPage, startPage + maxVisiblePage - 1);
  const adjustedStartPage = Math.max(1, endPage - maxVisiblePage + 1);

  return Array.from(
    { length: endPage - adjustedStartPage + 1 },
    (_, index) => adjustedStartPage + index
  );
};

const isProductApiError = (
  response: ProductResponse | ProductApiError
): response is ProductApiError => {
  return "success" in response && response.success === false;
};

type AddClassProps = {
  initialProduct?: ProductResponse | null;
  initialProductError?: string | null;
};

export const AddClass = ({
  initialProduct,
  initialProductError,
}: AddClassProps) => {
  const router = useRouter();
  const isInitialRender = useRef(true);
  const [dataProduct, setDataProduct] = useState<Product[]>(
    initialProduct?.results ?? []
  );
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchProduct, setSearchProduct] = useState("");
  const [orderByDate, setOrderByDate] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProduct, setTotalProduct] = useState(initialProduct?.total ?? 0);
  const [hasNextProduct, setHasNextProduct] = useState(
    initialProduct?.hasNext ?? false
  );
  const [hasPreviousProduct, setHasPreviousProduct] = useState(
    initialProduct?.hasPrevious ?? false
  );
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      productType: "",
      productId: "",
      publish: false,
      publishTime: "",
      title: "",
      isAutoGetCertificate: false,
    },
  });

  const fetchProduct = async () => {
    setIsLoadingProduct(true);

    try {
      const product = await fetchProductApi<ProductResponse>("/product", {
        query: {
          page: currentPage,
          limit: pageSize,
          orderByDate,
          search: searchProduct,
        },
      });

      if (isProductApiError(product)) {
        toast.error(product.message);
        setDataProduct([]);
        setTotalProduct(0);
        setHasNextProduct(false);
        setHasPreviousProduct(false);
        return;
      }

      setDataProduct(product.results ?? []);
      setTotalProduct(product.total ?? 0);
      setHasNextProduct(product.hasNext ?? false);
      setHasPreviousProduct(product.hasPrevious ?? false);
    } catch (error) {
      toast.error("Gagal mengambil data produk");
      setDataProduct([]);
      setTotalProduct(0);
      setHasNextProduct(false);
      setHasPreviousProduct(false);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const onFinish = async (value: ClassFormValues) => {
    const store: ApiResponse = await fetchApi("/admin/classroom", {
      method: "POST",
      body: {
        ...value,
        productId: Number(value.productId),
        publishTime: toOffsetDateTime(value.publishTime),
      },
    });

    if (!store) {
      toast.error("Error tidak ditemukan");
      return;
    }

    if (store.statusCode === 200 || store.statusCode === 201) {
      toast.info("Success menambahkan kelas");
      form.reset();
      setSelectedProductId("");
      setSelectedProduct(null);
      router.push("/dashboard/classroom");
      return;
    }

    toast.error(store.message);
  };

  useEffect(() => {
    if (initialProductError) {
      toast.error(initialProductError);
    }
  }, [initialProductError]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    fetchProduct();
  }, [currentPage, orderByDate, searchProduct]);

  const totalPage = Math.max(1, Math.ceil(totalProduct / pageSize));

  const handleSearchProduct = (value: string) => {
    setSearchProduct(value);
    setCurrentPage(1);
  };

  const handleOrderByDate = (value: string) => {
    setOrderByDate(value);
    setCurrentPage(1);
  };

  const handleSelectProduct = (value: string) => {
    const product = dataProduct.find((item) => item.id.toString() === value);

    setSelectedProductId(value);
    setSelectedProduct(product ?? null);
    form.setValue("productId", value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  useEffect(() => {
    if (currentPage > totalPage) setCurrentPage(totalPage);
  }, [currentPage, totalPage]);

  const paginationPages = getPaginationPages(currentPage, totalPage);

  return (
    <div className="w-full">
      <DashboardPageTitle title="Tambah Kelas" />
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tambah Kelas</h1>
          <p className="text-sm text-muted-foreground">
            Buat kelas baru dan lihat daftar produk yang sudah tersedia.
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/dashboard/classroom">Kembali</Link>
        </Button>
      </div>

      <div className="grid gap-8">
        <div className="rounded-lg border p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFinish)}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Produk</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe produk" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productTypeOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <IInput control={form.control} label="Title" name="title" />
                <IInput
                  control={form.control}
                  label="Publish Time"
                  name="publishTime"
                  type="datetime-local"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ISwitch
                    control={form.control}
                    label="Publish"
                    name="publish"
                  />
                  <ISwitch
                    control={form.control}
                    label="Auto Get Certificate"
                    name="isAutoGetCertificate"
                  />
                </div>
              </div>
              <div className="mt-6 grid gap-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <Label className="text-base font-semibold">
                      Tabel Produk
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Pilih satu produk dari daftar di bawah.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 md:w-[520px]">
                    <div className="grid gap-2">
                      <Label htmlFor="search-product">Search</Label>
                      <Input
                        id="search-product"
                        placeholder="Cari judul produk"
                        value={searchProduct}
                        onChange={(event) =>
                          handleSearchProduct(event.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Filter</Label>
                      <Select
                        value={orderByDate}
                        onValueChange={handleOrderByDate}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Urutkan produk" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">Terbaru</SelectItem>
                          <SelectItem value="asc">Terlama</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <RadioGroup
                  value={selectedProductId}
                  onValueChange={handleSelectProduct}
                >
                  <Table className="w-full">
                    <TableCaption>Table Product</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[64px]">Pilih</TableHead>
                        <TableHead>Judul</TableHead>
                        <TableHead>Tanggal Dibuat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingProduct
                        ? loadingRows.map((_, index) => (
                            <TableRow key={`loading-product-${index}`}>
                              <TableCell>
                                <Skeleton className="h-4 w-4 rounded-full" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-4 w-full max-w-[420px]" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-4 w-32" />
                              </TableCell>
                            </TableRow>
                          ))
                        : dataProduct.map((item) => (
                            <TableRow
                              key={item.id}
                              className={`cursor-pointer transition-colors ${
                                selectedProductId === item.id.toString()
                                  ? "bg-primary/10 hover:bg-primary/15"
                                  : "hover:bg-muted/50"
                              }`}
                              onClick={() =>
                                handleSelectProduct(item.id.toString())
                              }
                            >
                              <TableCell>
                                <RadioGroupItem
                                  aria-label={`Pilih ${item.name}`}
                                  type="button"
                                  value={item.id.toString()}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleSelectProduct(item.id.toString());
                                  }}
                                />
                              </TableCell>
                              <TableCell className="font-medium">
                                {item.name}
                              </TableCell>
                              <TableCell>
                                {formatDate(
                                  item.category?.created_at ?? item.time_start
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      {!isLoadingProduct && dataProduct.length === 0 ? (
                        <TableRow>
                          <TableCell
                            className="h-24 text-center text-muted-foreground"
                            colSpan={3}
                          >
                            Produk tidak ditemukan
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </RadioGroup>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan {dataProduct.length} dari {totalProduct} produk
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={!hasPreviousProduct || isLoadingProduct}
                      onClick={() => {
                        setIsLoadingProduct(true);
                        setCurrentPage((page) => page - 1);
                      }}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {paginationPages.map((page) => (
                        <Button
                          key={page}
                          type="button"
                          size="icon"
                          variant={
                            page === currentPage ? "default" : "secondary"
                          }
                          disabled={isLoadingProduct}
                          onClick={() => {
                            if (page === currentPage) return;
                            setIsLoadingProduct(true);
                            setCurrentPage(page);
                          }}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={!hasNextProduct || isLoadingProduct}
                      onClick={() => {
                        setIsLoadingProduct(true);
                        setCurrentPage((page) => page + 1);
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Produk Terpilih</FormLabel>
                    <FormControl>
                      <input type="hidden" {...field} />
                    </FormControl>
                    <div
                      className={`rounded-md border px-4 py-3 text-sm ${
                        selectedProduct
                          ? "border-primary bg-primary/10"
                          : "border-dashed text-muted-foreground"
                      }`}
                    >
                      {selectedProduct ? (
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <span className="font-medium">
                            {selectedProduct.name}
                          </span>
                          <span>ID Produk: {selectedProduct.id}</span>
                        </div>
                      ) : (
                        "Belum ada produk yang dipilih"
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-6 flex justify-end">
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

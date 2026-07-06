"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { useDashboardContext } from "@/context/DashboardContext";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  Loader2,
  Search,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { UIEvent } from "react";
import type { FieldErrors } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DashboardPageTitle } from "../../_component/page-title";

enum ProductType {
  VIDEO_LEARNING = "VIDEO_LEARNING",
  BOOTCAMP = "BOOTCAMP",
}

const classSchema = z.object({
  productId: z.coerce.number().int().min(1, "Produk wajib dipilih"),
  instructorId: z.coerce.number().int().min(1, "Instruktur wajib dipilih"),
  adminIds: z.array(z.coerce.number().int().min(1)).optional().default([]),
  title: z.string().min(1, "Title wajib diisi"),
  productType: z.nativeEnum(ProductType, {
    required_error: "Tipe produk wajib dipilih",
    invalid_type_error: "Tipe produk wajib dipilih",
  }),
  publish: z.boolean().optional().default(true),
  publishTime: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce.date().optional()
  ),
  thumbnail: z.string().optional().default(""),
  isAutoGetCertificate: z.boolean().optional().default(false),
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

type ProductResponse = {
  results: Product[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

type ProductApiError = {
  success: false;
  message: string;
  statusCode: number;
};

type InstructorOption = {
  id: string;
  name: string;
  username: string;
  role: "PIC" | "PENGAJAR";
};

type InstructorListData = {
  data: Array<Omit<InstructorOption, "id"> & { id: string | number }>;
  pagination: {
    page: number;
    limit: number;
    totalData: number;
    totalPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

type AdminOption = {
  id: string;
  name: string;
  username: string;
  role: "ADMIN" | "PIC";
};

type AdminListData = {
  results?: Array<Omit<AdminOption, "id"> & { id: string | number }>;
  data?: Array<Omit<AdminOption, "id"> & { id: string | number }>;
  total?: number;
  page?: number;
  limit?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  pagination?: {
    page: number;
    limit: number;
    totalData: number;
    totalPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

const instructorBatchSize = 5;

const productTypeOptions = [
  {
    label: "VIDEO_LEARNING",
    value: ProductType.VIDEO_LEARNING,
  },
  {
    label: "BOOTCAMP",
    value: ProductType.BOOTCAMP,
  },
];

const pageSize = 5;

const loadingRows = Array.from({ length: pageSize });

const normalizeAdminListData = (data?: AdminListData | null) => {
  const accounts = data?.results ?? data?.data ?? [];

  return {
    accounts: accounts.map((account) => ({
      ...account,
      id: String(account.id),
    })),
    total: data?.total ?? data?.pagination?.totalData ?? 0,
    hasNext: data?.hasNext ?? data?.pagination?.hasNextPage ?? false,
    hasPrevious:
      data?.hasPrevious ?? data?.pagination?.hasPreviousPage ?? false,
  };
};

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

const Page = () => {
  const router = useRouter();
  const { user } = useDashboardContext();
  const [dataProduct, setDataProduct] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchProduct, setSearchProduct] = useState("");
  const [orderByDate, setOrderByDate] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProduct, setTotalProduct] = useState(0);
  const [hasNextProduct, setHasNextProduct] = useState(false);
  const [hasPreviousProduct, setHasPreviousProduct] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [instructorOptions, setInstructorOptions] = useState<
    InstructorOption[]
  >([]);
  const [isInstructorOpen, setIsInstructorOpen] = useState(false);
  const [instructorSearch, setInstructorSearch] = useState("");
  const [instructorPage, setInstructorPage] = useState(1);
  const [hasNextInstructor, setHasNextInstructor] = useState(false);
  const [isLoadingInstructors, setIsLoadingInstructors] = useState(false);
  const [isLoadingMoreInstructors, setIsLoadingMoreInstructors] =
    useState(false);
  const [instructorError, setInstructorError] = useState("");
  const [adminAccounts, setAdminAccounts] = useState<AdminOption[]>([]);
  const [selectedAdminAccounts, setSelectedAdminAccounts] = useState<
    AdminOption[]
  >([]);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminPage, setAdminPage] = useState(1);
  const [totalAdmin, setTotalAdmin] = useState(0);
  const [hasNextAdmin, setHasNextAdmin] = useState(false);
  const [hasPreviousAdmin, setHasPreviousAdmin] = useState(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [picAccounts, setPicAccounts] = useState<AdminOption[]>([]);
  const [selectedPicAccounts, setSelectedPicAccounts] = useState<
    AdminOption[]
  >([]);
  const [picSearch, setPicSearch] = useState("");
  const [picPage, setPicPage] = useState(1);
  const [totalPic, setTotalPic] = useState(0);
  const [hasNextPic, setHasNextPic] = useState(false);
  const [hasPreviousPic, setHasPreviousPic] = useState(false);
  const [isLoadingPic, setIsLoadingPic] = useState(false);
  const [picError, setPicError] = useState("");
  const instructorComboboxRef = useRef<HTMLDivElement>(null);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      instructorId: 0,
      adminIds: [],
      productId: 0,
      publish: true,
      title: "",
      thumbnail: "",
      isAutoGetCertificate: false,
    },
  });

  const selectedInstructorId = form.watch("instructorId");
  const selectedAccountIds = form.watch("adminIds") ?? [];
  const currentAdminAccount = useMemo<AdminOption | null>(() => {
    if (!user) return null;

    return {
      id: String(user.id),
      name: user.name,
      username: user.username ?? user.email ?? "-",
      role: "ADMIN",
    };
  }, [user]);
  const currentAdminId = currentAdminAccount
    ? Number(currentAdminAccount.id)
    : null;
  const selectedInstructor = instructorOptions.find(
    (instructor) => Number(instructor.id) === selectedInstructorId
  );
  const filteredInstructors = useMemo(() => {
    const keyword = instructorSearch.trim().toLowerCase();

    if (!keyword) return instructorOptions;

    return instructorOptions.filter(
      (instructor) =>
        instructor.name.toLowerCase().includes(keyword) ||
        instructor.username.toLowerCase().includes(keyword) ||
        instructor.role.toLowerCase().includes(keyword)
    );
  }, [instructorOptions, instructorSearch]);

  const fetchInstructors = async (page: number, append = false) => {
    if (append) {
      setIsLoadingMoreInstructors(true);
    } else {
      setIsLoadingInstructors(true);
      setInstructorError("");
    }

    const response: ApiResponse<InstructorListData> = await fetchApi(
      `/admin/instructor?page=${page}&limit=${instructorBatchSize}`
    );

    if (response.statusCode === 200 && response.data) {
      const nextInstructors = (response.data.data ?? []).map((instructor) => ({
        ...instructor,
        id: String(instructor.id),
      }));

      setInstructorOptions((currentInstructors) => {
        if (!append) return nextInstructors;

        const instructorMap = new Map(
          currentInstructors.map((instructor) => [instructor.id, instructor])
        );
        nextInstructors.forEach((instructor) => {
          instructorMap.set(instructor.id, instructor);
        });

        return Array.from(instructorMap.values());
      });
      setInstructorPage(response.data.pagination?.page ?? page);
      setHasNextInstructor(response.data.pagination?.hasNextPage ?? false);
    } else if (!append) {
      setInstructorOptions([]);
      setHasNextInstructor(false);
      setInstructorError(
        response.message || "Gagal mengambil data instruktur."
      );
    } else {
      toast.error(response.message || "Gagal memuat instruktur berikutnya.");
    }

    setIsLoadingInstructors(false);
    setIsLoadingMoreInstructors(false);
  };

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

  const fetchAccounts = async (role: "ADMIN" | "PIC") => {
    const isAdmin = role === "ADMIN";
    const page = isAdmin ? adminPage : picPage;
    const search = isAdmin ? adminSearch : picSearch;

    if (isAdmin) {
      setIsLoadingAdmin(true);
      setAdminError("");
    } else {
      setIsLoadingPic(true);
      setPicError("");
    }

    const query = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
      role,
    });

    if (search.trim()) query.set("search", search.trim());

    const response: ApiResponse<AdminListData> = await fetchApi(
      `/admin/admin?${query.toString()}`
    );

    if (response.statusCode === 200 && response.data) {
      const normalized = normalizeAdminListData(response.data);

      if (isAdmin) {
        setAdminAccounts(normalized.accounts);
        setTotalAdmin(normalized.total);
        setHasNextAdmin(normalized.hasNext);
        setHasPreviousAdmin(normalized.hasPrevious);
      } else {
        setPicAccounts(normalized.accounts);
        setTotalPic(normalized.total);
        setHasNextPic(normalized.hasNext);
        setHasPreviousPic(normalized.hasPrevious);
      }
    } else if (isAdmin) {
      setAdminAccounts([]);
      setTotalAdmin(0);
      setHasNextAdmin(false);
      setHasPreviousAdmin(false);
      setAdminError(response.message || "Gagal mengambil data admin.");
    } else {
      setPicAccounts([]);
      setTotalPic(0);
      setHasNextPic(false);
      setHasPreviousPic(false);
      setPicError(response.message || "Gagal mengambil data PIC.");
    }

    if (isAdmin) {
      setIsLoadingAdmin(false);
    } else {
      setIsLoadingPic(false);
    }
  };

  const onFinish = async (value: ClassFormValues) => {
    const body = {
      productId: value.productId,
      instructorId: value.instructorId,
      adminIds: value.adminIds ?? [],
      title: value.title,
      productType: value.productType,
      publish: value.publish ?? true,
      ...(value.publishTime
        ? { publishTime: toOffsetDateTime(value.publishTime) }
        : {}),
      thumbnail: value.thumbnail ?? "",
      isAutoGetCertificate: value.isAutoGetCertificate ?? false,
    };

    const store: ApiResponse = await fetchApi("/admin/classroom/add", {
      method: "POST",
      body,
    });

    if (!store) {
      toast.error("Error tidak ditemukan");
      return;
    }

    if (store.statusCode === 200 || store.statusCode === 201) {
      toast.info("Success menambahkan kelas");
      form.reset({
        instructorId: 0,
        adminIds: currentAdminId ? [currentAdminId] : [],
        productId: 0,
        publish: true,
        title: "",
        thumbnail: "",
        isAutoGetCertificate: false,
      });
      setIsInstructorOpen(false);
      setInstructorSearch("");
      setSelectedProductId("");
      setSelectedProduct(null);
      setSelectedAdminAccounts(
        currentAdminAccount ? [currentAdminAccount] : []
      );
      setSelectedPicAccounts([]);
      fetchProduct();
      router.push("/dashboard/classroom");
      return;
    }

    toast.error(store.message);
  };

  const onInvalidSubmit = (errors: FieldErrors<ClassFormValues>) => {
    const firstError = Object.values(errors)[0];
    const message =
      typeof firstError?.message === "string"
        ? firstError.message
        : "Lengkapi data kelas terlebih dahulu.";

    toast.error(message);
  };

  useEffect(() => {
    fetchProduct();
  }, [currentPage, orderByDate, searchProduct]);

  useEffect(() => {
    void fetchInstructors(1);
  }, []);

  useEffect(() => {
    if (
      !currentAdminAccount ||
      currentAdminId === null ||
      !Number.isInteger(currentAdminId)
    ) {
      return;
    }

    const currentValue = form.getValues("adminIds") ?? [];

    if (!currentValue.includes(currentAdminId)) {
      form.setValue("adminIds", [currentAdminId, ...currentValue], {
        shouldValidate: true,
      });
    }

    setSelectedAdminAccounts((currentAccounts) => {
      if (
        currentAccounts.some(
          (account) => Number(account.id) === currentAdminId
        )
      ) {
        return currentAccounts;
      }

      return [currentAdminAccount, ...currentAccounts];
    });
  }, [currentAdminAccount, currentAdminId, form]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchAccounts("ADMIN");
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [adminPage, adminSearch]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchAccounts("PIC");
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [picPage, picSearch]);

  useEffect(() => {
    if (
      !instructorSearch.trim() ||
      !hasNextInstructor ||
      isLoadingInstructors ||
      isLoadingMoreInstructors
    ) {
      return;
    }

    void fetchInstructors(instructorPage + 1, true);
  }, [
    hasNextInstructor,
    instructorPage,
    instructorSearch,
    isLoadingInstructors,
    isLoadingMoreInstructors,
  ]);

  useEffect(() => {
    const closeInstructorCombobox = (event: MouseEvent) => {
      if (
        instructorComboboxRef.current &&
        !instructorComboboxRef.current.contains(event.target as Node)
      ) {
        setIsInstructorOpen(false);
        setInstructorSearch("");
      }
    };

    document.addEventListener("mousedown", closeInstructorCombobox);
    return () =>
      document.removeEventListener("mousedown", closeInstructorCombobox);
  }, []);

  const totalPage = Math.max(1, Math.ceil(totalProduct / pageSize));
  const totalAdminPage = Math.max(1, Math.ceil(totalAdmin / pageSize));
  const totalPicPage = Math.max(1, Math.ceil(totalPic / pageSize));

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
    form.setValue("productId", Number(value), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSelectAdmin = (account: AdminOption) => {
    const accountId = Number(account.id);

    if (accountId === currentAdminId) {
      return;
    }

    const currentValue = form.getValues("adminIds") ?? [];
    const isSelected = currentValue.includes(accountId);
    const nextValue = currentValue.includes(accountId)
      ? currentValue.filter((id) => id !== accountId)
      : [...currentValue, accountId];

    if (isSelected) {
      setSelectedPicAccounts((currentAccounts) =>
        currentAccounts.filter((item) => item.id !== account.id)
      );
    }

    setSelectedAdminAccounts((currentAccounts) => {
      if (!nextValue.includes(accountId)) {
        return currentAccounts.filter((item) => item.id !== account.id);
      }

      if (currentAccounts.some((item) => item.id === account.id)) {
        return currentAccounts;
      }

      return [...currentAccounts, account];
    });
    form.setValue("adminIds", nextValue, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSelectPic = (account: AdminOption) => {
    const accountId = Number(account.id);
    const currentValue = form.getValues("adminIds") ?? [];
    const isSelected = currentValue.includes(accountId);
    const nextValue = currentValue.includes(accountId)
      ? currentValue.filter((id) => id !== accountId)
      : [...currentValue, accountId];

    if (isSelected) {
      setSelectedAdminAccounts((currentAccounts) =>
        currentAccounts.filter((item) => item.id !== account.id)
      );
    }

    setSelectedPicAccounts((currentAccounts) => {
      if (!nextValue.includes(accountId)) {
        return currentAccounts.filter((item) => item.id !== account.id);
      }

      if (currentAccounts.some((item) => item.id === account.id)) {
        return currentAccounts;
      }

      return [...currentAccounts, account];
    });
    form.setValue("adminIds", nextValue, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleInstructorScroll = (event: UIEvent<HTMLDivElement>) => {
    const list = event.currentTarget;
    const isNearBottom =
      list.scrollHeight - list.scrollTop - list.clientHeight < 40;

    if (
      !isNearBottom ||
      !hasNextInstructor ||
      isLoadingInstructors ||
      isLoadingMoreInstructors
    ) {
      return;
    }

    void fetchInstructors(instructorPage + 1, true);
  };

  const selectInstructor = (instructor: InstructorOption) => {
    form.setValue("instructorId", Number(instructor.id), {
      shouldDirty: true,
      shouldValidate: true,
    });
    setInstructorSearch("");
    setIsInstructorOpen(false);
  };

  useEffect(() => {
    if (currentPage > totalPage) setCurrentPage(totalPage);
  }, [currentPage, totalPage]);

  useEffect(() => {
    if (adminPage > totalAdminPage) setAdminPage(totalAdminPage);
  }, [adminPage, totalAdminPage]);

  useEffect(() => {
    if (picPage > totalPicPage) setPicPage(totalPicPage);
  }, [picPage, totalPicPage]);

  const paginationPages = getPaginationPages(currentPage, totalPage);
  const adminPaginationPages = getPaginationPages(adminPage, totalAdminPage);
  const picPaginationPages = getPaginationPages(picPage, totalPicPage);

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
            <form onSubmit={form.handleSubmit(onFinish, onInvalidSubmit)}>
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
              <FormField
                control={form.control}
                name="instructorId"
                render={() => (
                  <FormItem className="mt-4 max-w-2xl">
                    <FormLabel>Instruktur</FormLabel>
                    <div ref={instructorComboboxRef} className="relative">
                      {isInstructorOpen ? (
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            autoFocus
                            className="pl-9 pr-9"
                            value={instructorSearch}
                            onChange={(event) =>
                              setInstructorSearch(event.target.value)
                            }
                            placeholder="Cari nama, username, atau role"
                          />
                          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-between px-3 font-normal"
                          onClick={() => setIsInstructorOpen(true)}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">
                              {selectedInstructor
                                ? `${selectedInstructor.name} - ${selectedInstructor.username}`
                                : "Cari dan pilih instruktur"}
                            </span>
                          </span>
                          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </Button>
                      )}

                      {isInstructorOpen ? (
                        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
                          <div
                            className="max-h-56 overflow-y-auto p-1"
                            onScroll={handleInstructorScroll}
                          >
                            {isLoadingInstructors ? (
                              <div className="flex items-center justify-center gap-2 px-3 py-8 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Memuat instruktur...
                              </div>
                            ) : null}

                            {!isLoadingInstructors &&
                              filteredInstructors.map((instructor) => (
                                <button
                                  key={instructor.id}
                                  type="button"
                                  className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left text-sm transition-colors hover:bg-accent"
                                  onClick={() => selectInstructor(instructor)}
                                >
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <UserRound className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">
                                      {instructor.name}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                      {instructor.username} · {instructor.role}
                                    </p>
                                  </div>
                                  {Number(instructor.id) ===
                                  selectedInstructorId ? (
                                    <Check className="h-4 w-4 shrink-0 text-primary" />
                                  ) : null}
                                </button>
                              ))}

                            {!isLoadingInstructors &&
                            !isLoadingMoreInstructors &&
                            !filteredInstructors.length ? (
                              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                                {instructorError ||
                                  "Instruktur tidak ditemukan"}
                              </div>
                            ) : null}

                            {isLoadingMoreInstructors ? (
                              <div className="flex items-center justify-center gap-2 px-3 py-3 text-xs text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Memuat instruktur...
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ketik untuk mencari, lalu scroll untuk memuat data lainnya.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="adminIds"
                  render={({ field }) => (
                    <FormItem>
                      <AccountSelectionTable
                        label="Admin"
                        searchId="search-admin"
                        accounts={adminAccounts}
                        selectedAccounts={selectedAdminAccounts}
                        value={field.value ?? []}
                        search={adminSearch}
                        total={totalAdmin}
                        currentPage={adminPage}
                        paginationPages={adminPaginationPages}
                        hasNext={hasNextAdmin}
                        hasPrevious={hasPreviousAdmin}
                        isLoading={isLoadingAdmin}
                        error={adminError}
                        lockedAccountIds={
                          currentAdminId ? [currentAdminId] : []
                        }
                        onSearchChange={(value) => {
                          setAdminSearch(value);
                          setAdminPage(1);
                        }}
                        onPageChange={setAdminPage}
                        onSelect={handleSelectAdmin}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <AccountSelectionTable
                  label="PIC"
                  searchId="search-pic"
                  accounts={picAccounts}
                  selectedAccounts={selectedPicAccounts}
                  value={selectedAccountIds}
                  search={picSearch}
                  total={totalPic}
                  currentPage={picPage}
                  paginationPages={picPaginationPages}
                  hasNext={hasNextPic}
                  hasPrevious={hasPreviousPic}
                  isLoading={isLoadingPic}
                  error={picError}
                  onSearchChange={(value) => {
                    setPicSearch(value);
                    setPicPage(1);
                  }}
                  onPageChange={setPicPage}
                  onSelect={handleSelectPic}
                />
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
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Page;

type AccountSelectionTableProps = {
  label: string;
  searchId: string;
  accounts: AdminOption[];
  selectedAccounts: AdminOption[];
  value: number[];
  search: string;
  total: number;
  currentPage: number;
  paginationPages: number[];
  hasNext: boolean;
  hasPrevious: boolean;
  isLoading: boolean;
  error?: string;
  lockedAccountIds?: number[];
  onSearchChange: (value: string) => void;
  onPageChange: (value: number | ((page: number) => number)) => void;
  onSelect: (account: AdminOption) => void;
};

function AccountSelectionTable({
  label,
  searchId,
  accounts,
  selectedAccounts,
  value,
  search,
  total,
  currentPage,
  paginationPages,
  hasNext,
  hasPrevious,
  isLoading,
  error,
  lockedAccountIds = [],
  onSearchChange,
  onPageChange,
  onSelect,
}: AccountSelectionTableProps) {
  const selectedNames = selectedAccounts.map((account) => account.name);

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <FormLabel>{label}</FormLabel>
          <p className="mt-1 text-sm text-muted-foreground">
            Pilih satu atau lebih {label}.
          </p>
        </div>
        <div className="grid gap-2 sm:w-64">
          <Label htmlFor={searchId}>Search</Label>
          <Input
            id={searchId}
            placeholder={`Cari ${label.toLowerCase()}`}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>

      <Table className="w-full">
        <TableCaption>Table {label}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[64px]">Pilih</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Username</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? loadingRows.map((_, index) => (
                <TableRow key={`loading-${label}-${index}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-4 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full max-w-[220px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                </TableRow>
              ))
            : accounts.map((account) => {
                const accountId = Number(account.id);
                const isSelected = value.includes(accountId);
                const isLocked = lockedAccountIds.includes(accountId);

                return (
                  <TableRow
                    key={account.id}
                    className={`transition-colors ${
                      isLocked
                        ? "cursor-not-allowed opacity-75"
                        : "cursor-pointer"
                    } ${
                      isSelected
                        ? "bg-primary/10 hover:bg-primary/15"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      if (!isLocked) onSelect(account);
                    }}
                  >
                    <TableCell>
                      <Button
                        type="button"
                        size="icon"
                        variant={isSelected ? "default" : "outline"}
                        className="h-7 w-7"
                        aria-label={
                          isLocked
                            ? `${account.name} otomatis dipilih`
                            : `Pilih ${account.name}`
                        }
                        disabled={isLocked}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (!isLocked) onSelect(account);
                        }}
                      >
                        {isSelected ? <Check className="h-4 w-4" /> : null}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      {account.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {account.username}
                    </TableCell>
                  </TableRow>
                );
              })}
          {!isLoading && accounts.length === 0 ? (
            <TableRow>
              <TableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={3}
              >
                {error || `${label} tidak ditemukan`}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan {accounts.length} dari {total} {label.toLowerCase()}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={!hasPrevious || isLoading}
            onClick={() => onPageChange((page) => page - 1)}
          >
            Previous
          </Button>
          {paginationPages.map((page) => (
            <Button
              key={page}
              type="button"
              size="icon"
              variant={page === currentPage ? "default" : "secondary"}
              disabled={isLoading}
              aria-label={`Halaman ${page} ${label}`}
              aria-current={page === currentPage ? "page" : undefined}
              onClick={() => {
                if (page === currentPage) return;
                onPageChange(page);
              }}
            >
              {page}
            </Button>
          ))}
          <Button
            type="button"
            variant="secondary"
            disabled={!hasNext || isLoading}
            onClick={() => onPageChange((page) => page + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <div
        className={`rounded-md border px-4 py-3 text-sm ${
          selectedAccounts.length
            ? "border-primary bg-primary/10"
            : "border-dashed text-muted-foreground"
        }`}
      >
        {selectedAccounts.length
          ? `${selectedAccounts.length} ${label} dipilih: ${selectedNames.join(
              ", "
            )}`
          : `Belum ada ${label} yang dipilih`}
      </div>
    </div>
  );
}

"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { useEffect, useMemo, useState } from "react";
import { DashboardPageTitle } from "../_component/page-title";
import Link from "next/link";
import { useDashboardContext } from "@/context/DashboardContext";
import { canManageClassroom } from "@/lib/dashboard-permissions";

const pageSize = 5;

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

const Page = () => {
  const { user } = useDashboardContext();
  const canManage = canManageClassroom(user?.role);
  const [dataClass, setDataClass] = useState<any[]>([]);
  const [searchClassroom, setSearchClassroom] = useState("");
  const [orderByDate, setOrderByDate] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAllClass = async () => {
    const getAllClass: ApiResponse = await fetchApi(`/admin/classroom/show-all`);
    setDataClass(getAllClass.data ?? []);
  };

  useEffect(() => {
    fetchAllClass();
  }, []);

  const filteredClassroom = useMemo(() => {
    return dataClass
      .filter((item) => {
        const keyword = searchClassroom.toLowerCase();
        const title = item.title?.toLowerCase() ?? "";
        const productType = item.productType?.toLowerCase() ?? "";

        return title.includes(keyword) || productType.includes(keyword);
      })
      .sort((firstClass, secondClass) => {
        const firstDate = new Date(firstClass.createdAt).getTime();
        const secondDate = new Date(secondClass.createdAt).getTime();

        return orderByDate === "desc"
          ? secondDate - firstDate
          : firstDate - secondDate;
      });
  }, [dataClass, orderByDate, searchClassroom]);

  const totalPage = Math.max(1, Math.ceil(filteredClassroom.length / pageSize));
  const paginatedClassroom = filteredClassroom.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const paginationPages = getPaginationPages(currentPage, totalPage);

  const handleSearchClassroom = (value: string) => {
    setSearchClassroom(value);
    setCurrentPage(1);
  };

  const handleOrderByDate = (value: string) => {
    setOrderByDate(value);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setSearchClassroom("");
    setOrderByDate("desc");
    setCurrentPage(1);
  };

  useEffect(() => {
    if (currentPage > totalPage) setCurrentPage(totalPage);
  }, [currentPage, totalPage]);

  return (
    <div className="w-full">
      <DashboardPageTitle title="Kelas" />
      <div>
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="search-classroom">Search</Label>
              <Input
                id="search-classroom"
                placeholder="Cari kelas atau tipe"
                value={searchClassroom}
                onChange={(event) => handleSearchClassroom(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Filter Tanggal</Label>
              <Select value={orderByDate} onValueChange={handleOrderByDate}>
                <SelectTrigger>
                  <SelectValue placeholder="Urutkan tanggal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Terbaru</SelectItem>
                  <SelectItem value="asc">Terlama</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                type="button"
                variant="secondary"
                onClick={handleResetFilter}
              >
                Reset
              </Button>
            </div>
          </div>
          {canManage ? (
            <div>
              <Button asChild>
                <Link href="/dashboard/classroom/add-classroom">
                  Tambah Kelas
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
        <Table className="w-full">
          <TableCaption>List Kelas</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kelas</TableHead>
              <TableHead>Publish</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Total Peserta</TableHead>
              <TableHead>Dibuat Pada</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClassroom?.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                  {item.isPublished ?? item.publish ? "Ya" : "Tidak"}
                </TableCell>
                <TableCell>{item.productType}</TableCell>
                <TableCell>{item._count?.userClass ?? 0}</TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="max-w-fit flex items-center gap-2">
                  <Button asChild>
                    <Link href={`/dashboard/classroom/${item.id}`}>
                      Masuk Kelas
                    </Link>
                  </Button>
                  {/* <Button className="bg-yellow-500">Edit</Button> */}
                  {canManage ? (
                    <Button variant="destructive">Hapus</Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
            {paginatedClassroom.length === 0 ? (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={6}
                >
                  Kelas tidak ditemukan
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {paginatedClassroom.length} dari{" "}
            {filteredClassroom.length} kelas
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {paginationPages.map((page) => (
                <Button
                  key={page}
                  type="button"
                  size="icon"
                  variant={page === currentPage ? "default" : "secondary"}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={currentPage === totalPage}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

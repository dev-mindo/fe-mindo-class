'use client'
import { Button } from "@/components/ui/button";
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
import { useEffect, useState } from "react";

const Page = () => {
  const [dataClass, setDataClass] = useState<any[]>([]);

  const fetchAllClass = async () => {
    const getAllClass: ApiResponse = await fetchApi(`/admin/classroom/show-all`);
    setDataClass(getAllClass.data ?? []);
  };

  useEffect(() => {
    fetchAllClass();
  }, []);

  useEffect(() => {
    console.log(dataClass)
  }
  , [dataClass]);

  return (
    <div className="w-full">
      <h1 className="text-lg">List Kelas</h1>
      <div>
        <div className="flex justify-between items-center mb-4">
          <div></div>
          <div className="">
            <Button>Tambah Kelas</Button>
        </div>
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
            {dataClass?.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.isPublished ? "Ya" : "Tidak"}</TableCell>
                <TableCell>{item.productType}</TableCell>
                <TableCell>{item._count.userClass}</TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="max-w-fit flex items-center gap-2">
                  <Button className="">List Peserta</Button>
                  <Button className="bg-yellow-500">Edit</Button>
                  <Button className="bg-red-500">Delete</Button>
                </TableCell>
              </TableRow>
            ))}           
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Page;

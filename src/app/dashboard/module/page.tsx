"use client";
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
import Link from "next/link";
import { useEffect, useState } from "react";

const Page = () => {
  const [dataClassModule, setDataClassModule] = useState<
    TClassModuleAll[] | []
  >([]);

  const fetchModuleClass = async () => {
    const getModuleClass: ApiResponse<TClassModuleAll[]> = await fetchApi(
      `/admin/module/show-all`
    );

    setDataClassModule(getModuleClass?.data || []);
  };

  useEffect(() => {
    fetchModuleClass();
  }, []);

  return (
    <div className="w-full">
      <h1 className="text-lg">List Module</h1>
      <div>
        <div className="flex justify-between items-center mb-4">
          <div></div>
          {/* <div>
            <Button>Tambah Module</Button>
          </div> */}
        </div>
        <Table className="w-full">
          <TableCaption>List Module</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kelas</TableHead>
              <TableHead>Tipe Kelas</TableHead>
              <TableHead>Total Section</TableHead>
              <TableHead>Total Module</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataClassModule.map((item) => (
              <TableRow>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.productType}</TableCell>
                <TableCell>{item._count.sections}</TableCell>
                {/* dataClassModule */}
                <TableCell>{item.totalModule}</TableCell>
                <TableCell className="flex gap-3">
                  <Button className="bg-yellow-500" asChild>
                    <Link href={`/dashboard/module/${item.id}`}>Edit</Link>
                  </Button>
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

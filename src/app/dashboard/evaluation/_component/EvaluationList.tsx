"use client";

import ICard from "@/components/base/ICard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { useEffect, useState } from "react";

export const EvaluationList = () => {
  const [dataClass, setDataClass] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const fetchAllClass = async () => {
    const getAllClass: ApiResponse = await fetchApi(
      `/admin/classroom/show-all`
    );
    setDataClass(getAllClass.data ?? []);
    console.log(getAllClass);
  };

  useEffect(() => {
    fetchAllClass();
  }, []);



  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Evaluasi</h1>
      {/* Add your evaluation list content here */}
      <div className="grid grid-cols-3 gap-4">
        <div className="w-full col-span-2">
          <ICard className="col-span-2">
            <h2 className="text-lg mb-4">Tabel Evaluasi</h2>
            <div className="flex gap-2 mb-2">
              <Select
                onValueChange={(value) => {
                  setSelectedClass(value);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>List Kelas</SelectLabel>
                    {dataClass?.map((item: any) => (
                      <SelectItem
                        key={item.id}
                        value={item.id}
                        // onClick={() => setSelectedClass(item.id)}
                        // onChange={(e) => {
                        //   setSelectedClass(e.target.value);
                        // }}
                      >
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input
                placeholder="Cari Evaluasi"
                disabled={dataClass.length === 0}
              />
            </div>
            <Table>
              <TableCaption>List of Evaluations</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kelas</TableHead>
                  <TableHead>Nama Section</TableHead>
                  <TableHead>Nama Modul</TableHead>
                  <TableHead>Total Pertanyaan</TableHead>
                  <TableHead>Sudah Mengerjakan</TableHead>
                  <TableHead>Belum Mengerjakan</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Example data, replace with actual data */}
                <TableRow>
                  <TableCell>Class A</TableCell>
                  <TableCell>Section 1</TableCell>
                  <TableCell>Module 1</TableCell>
                  <TableCell>10</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button>Detail</Button>
                      <Button className="bg-yellow-500">Edit</Button>
                      <Button className="bg-red-500">Hapus</Button>
                    </div>
                  </TableCell>
                </TableRow>
                {/* Repeat TableRow for more evaluations */}
              </TableBody>
            </Table>
          </ICard>
        </div>
        <div>
          <ICard>
            <h2 className="text-lg mb-4">Peserta yang Mengisi Evaluasi</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <h2 className="text-md mb-2">Kelas:</h2>
              <h2 className="text-md mb-2">Section: </h2>
              <h2 className="text-md mb-2">Module: </h2>
              <h2 className="text-md mb-2">Sudah: 10</h2>
              <h2 className="text-md mb-2">Belum: 10</h2>
              <h2 className="text-md mb-2">Total: 10</h2>
            </div>
            <Table>
              <TableCaption>List of Participants</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Peserta</TableHead>
                  <TableHead>Status Mengerjakan</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Example data, replace with actual data */}
                <TableRow>
                  <TableCell>John Doe</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Belum</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button>Detail</Button>
                    </div>
                  </TableCell>
                </TableRow>
                {/* Repeat TableRow for more participants */}
              </TableBody>
            </Table>
          </ICard>
        </div>
      </div>
    </div>
  );
};

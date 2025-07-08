"use client";
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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const router = useRouter()
  const [dataParticipant, setDataParticipant] = useState<any[]>([]);
  const [dataClass, setDataClass] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const fetchAllClass = async () => {
    const getAllClass: ApiResponse = await fetchApi(
      `/admin/classroom/show-all`
    );
    setDataClass(getAllClass.data ?? []);
    console.log(getAllClass);
  };

  const fetchAllParticipant = async () => {
    const getAllParticipant: ApiResponse = await fetchApi(
      `/admin/classroom/show-list-participant/${selectedClass}`
    );
    console.log(getAllParticipant);
    setDataParticipant(getAllParticipant.data ?? []);
  };

  useEffect(() => {
    fetchAllClass();
  }, []);

  useEffect(() => {
    console.log(selectedClass);
    if (selectedClass) {
      fetchAllParticipant();
    }
  }, [selectedClass]);

  return (
    <div className="w-full">
      <div className="my-[20px]">
        <h1 className="text-xl">List Peserta</h1>
      </div>
      <div>
        <div className="flex justify-between items-center my-4">
          <div className="flex gap-4">
            <Input placeholder="Cari Peserta" />
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
          </div>
          <div className="flex gap-4">
            <Button className="">Export to CSV</Button>
            <Button>Tambah Kelas</Button>
          </div>
        </div>
        <Table className="w-full">
          <TableCaption>List Kelas</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Peserta</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Total Nilai</TableHead>
              <TableHead>Mendapat Sertifikat</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataParticipant?.map((item: any) => (
              <TableRow key={item.userId}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.progress}</TableCell>
                <TableCell>{item.totalScore}</TableCell>
                <TableCell>
                  {item.isCertificateEligible ? "Sudah" : "Belum"}
                </TableCell>
                <TableCell className="max-w-fit flex items-center gap-2">
                  <Button className="" onClick={() => {
                    router.push(`/dashboard/list-participant/${selectedClass}/detail/${item.userId}`)
                  }}>Detail</Button>
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

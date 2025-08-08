"use client";
import ICard from "@/components/base/ICard";
import { Button } from "@/components/ui/button";
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
import { useEffect, useState } from "react";

export const DiscussionList = () => {
  const [discussionData, setDiscussionData] = useState();
  const [dataClass, setDataClass] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const fetchDiscussionByClass = async () => {
        
  };

  useEffect(() => {
    fetchDiscussionByClass();
  }, []);

  return (
    <div>
      <h1>Diskusi</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <ICard>
            <h2>Tabel Modul</h2>
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
            </div>
            <Table>
              <TableCaption>List of Modul</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Section</TableHead>
                  <TableHead>Nama Modul</TableHead>
                  <TableHead>Total Diskusi</TableHead>
                  <TableHead>Tanggapan Anda</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Example data, replace with actual data */}
                <TableRow>
                  <TableCell>Bagian A</TableCell>
                  <TableCell>Modul 1</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>10</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button>Detail</Button>                      
                    </div>
                  </TableCell>
                </TableRow>
                {/* Repeat TableRow for more evaluations */}
              </TableBody>
            </Table>
          </ICard>
        </div>
        <div>
          <div>
            <ICard>
              <h2 className="mb-4">Tabel Diskusi</h2>              
              <Table>
                <TableCaption>List of Diskusi</TableCaption>
                <TableHeader>
                  <TableRow>                    
                    <TableHead>Judul Diskusi</TableHead>
                    <TableHead>Total Diskusi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggapan Anda</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Example data, replace with actual data */}
                  <TableRow>
                    <TableCell>Bagian A</TableCell>
                    <TableCell>Bagian A</TableCell>
                    <TableCell>10</TableCell>
                    <TableCell>5</TableCell>                    
                    <TableCell>
                      <div className="flex gap-2">
                        <Button>Detail</Button>
                        <Button className="bg-red-500">Hapus</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {/* Repeat TableRow for more evaluations */}
                </TableBody>
              </Table>
            </ICard>
          </div>
        </div>
      </div>
    </div>
  );
};

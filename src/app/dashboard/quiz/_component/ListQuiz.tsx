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
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import Link from "next/link";
import { useEffect, useState } from "react";

export const ListQuiz = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [dataClass, setDataClass] = useState<any[]>([]);

  const [dataQuiz, setDataQuiz] = useState<TDataQuiz | null>(null);

  const fetchDataClass = async () => {
    const dataClass: ApiResponse = await fetchApi(`/admin/classroom/show-all`);
    if (dataClass && dataClass.data) {
      console.log(dataClass);
      setDataClass(dataClass.data);
    }
  };

  const fetchDataQuizByClassId = async () => {
    const dataQuiz: ApiResponse<TDataQuiz> = await fetchApi(
      `/admin/quiz/show-by-class/${selectedClass}`
    );
    if (dataQuiz) {
      if (dataQuiz.statusCode === 200 && dataQuiz.data) {
        setDataQuiz(dataQuiz.data);
      }else{
        setDataQuiz(null);
      }
    }
  };

  useEffect(() => {
    fetchDataClass();
  }, []);

  useEffect(() => {
    fetchDataQuizByClassId();
  }, [selectedClass]);

  return (
    <div>
      <ICard>
        <div className="flex gap-2 mb-2">
          <Select
            onValueChange={(value) => {
              setSelectedClass(value);
            }}
          >
            <SelectTrigger className="w-[50%]">
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
        <Table className="w-full">
          <TableCaption>List Module</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Bagian</TableHead>
              <TableHead>Modul</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Nilai Minimum </TableHead>
              <TableHead>Batas Percobaan</TableHead>
              <TableHead>Batas Waktu</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataQuiz?.map((item) => (
            <TableRow>
              <TableCell>{item.module.section.title}</TableCell>
              <TableCell>{item.module.title}</TableCell>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.minimumScore}</TableCell>
              <TableCell>{item.limitTrial}</TableCell>
              <TableCell>{item.limitTime}</TableCell>
              {/* dataClassModule */}              
              <TableCell className="flex gap-3">
                <Button className="bg-yellow-500" asChild>
                  <Link href={`/dashboard/quiz/${item.id}`}>Edit</Link>
                </Button>                
              </TableCell>
            </TableRow>
            ))}
          </TableBody>
        </Table>
      </ICard>
    </div>
  );
};

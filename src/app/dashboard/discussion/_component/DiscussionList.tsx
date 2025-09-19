"use client";
import ICard from "@/components/base/ICard";
import { Badge } from "@/components/ui/badge";
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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const DiscussionList = () => {
  const router = useRouter()
  const [discussionData, setDiscussionData] = useState();
  const [dataClass, setDataClass] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [sectionData, setSectionData] = useState<TDiscussionSection | null>(
    null
  );
  const [selectedIdModule, setSelectedIdModule] = useState<string>("");

  const [dataModules, setDataModule] = useState<TModuleDiscussion | null>(null);

  const fetchDataClass = async () => {
    const dataClass: ApiResponse = await fetchApi(`/admin/classroom/show-all`);
    if (dataClass && dataClass.data) {
      console.log(dataClass);
      setDataClass(dataClass.data);
    }
  };

  const fetchDiscussionByClass = async () => {
    console.log(selectedClass);
    const getSectionData: ApiResponse<TDiscussionSection> = await fetchApi(
      `/admin/discussion/show-by-class/${selectedClass}`
    );

    if (getSectionData && getSectionData.data) {
      setSectionData(getSectionData.data);
    }

    console.log(getSectionData);
  };

  const fetchDiscussionByModule = async () => {
    const getDiscussionModule: ApiResponse = await fetchApi(
      `/admin/discussion/show-by-module/${selectedIdModule}`
    );
    if (getDiscussionModule && getDiscussionModule.data) {
      setDataModule(getDiscussionModule.data);
      console.log(getDiscussionModule.data);
    }
  };

  useEffect(() => {
    fetchDataClass();
  }, []);

  useEffect(() => {
    fetchDiscussionByClass();
  }, [selectedClass]);

  useEffect(() => {
    fetchDiscussionByModule();
  }, [selectedIdModule]);  

  return (
    <div>
      <h1>Diskusi</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <ICard>
            <div className="mb-4">
              <h2>List Modul</h2>
            </div>
            <div className="flex gap-2 mb-2">
              <Select
                onValueChange={(value) => {
                  setSelectedClass(value);
                }}
              >
                <SelectTrigger className="w-full">
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
            <div className="flex flex-col gap-2 w-full">
              {sectionData?.map((sectionItem) => (
                <div
                  onClick={() => {
                    setSelectedIdModule(
                      sectionItem.module.at(0)?.id.toString() || ""
                    );
                  }}
                >
                  <ICard className="border w-full cursor hover:bg-[#212121] cursor-pointer">
                    <div className="flex flex-col gap-2">
                      <div className="">{sectionItem.title}</div>
                      <div className="">{sectionItem.module.at(0)?.title}</div>
                      <div className="">
                        Diskusi: {sectionItem.module.at(0)?._count.discussion}
                      </div>
                      <div className="">Tanggapan anda: 0</div>
                    </div>
                  </ICard>
                </div>
              ))}
            </div>
            {/* <Table>
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
              </TableBody>
            </Table> */}
          </ICard>
        </div>
        <div className="col-span-2">
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
                  {dataModules?.map((moduleItem) => (
                    <TableRow>
                      <TableCell>{moduleItem.title}</TableCell>
                      <TableCell>
                        {moduleItem._count.discussionAnswer}
                      </TableCell>
                      <TableCell>
                        {moduleItem.status ? (
                          <Badge variant={"default"}>open</Badge>
                        ) : (
                          <Badge variant={"destructive"}>close</Badge>
                        )}
                      </TableCell>
                      <TableCell>5</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button onClick={() => {
                            router.push(`/dashboard/discussion/${moduleItem.id}`)
                          }}>Detail</Button>
                          <Button className="bg-red-500">Hapus</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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

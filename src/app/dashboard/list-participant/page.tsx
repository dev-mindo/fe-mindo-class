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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ParticipantComponent } from "./_component/Participant";
import { TaskParticipantComponent } from "./_component/TaskParticipant";
import { ProgressParticipantComponent } from "./_component/ProgressModule";
import { ScoresParticipantComponent } from "./_component/ScoresParticipant";

const Page = () => {
  const [dataClass, setDataClass] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [tabsOn, setTabsOn] = useState<string>("");
  const [listSection, setListSection] = useState<TLIstSection[] | []>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null
  );

  const fetchAllClass = async () => {
    const getAllClass: ApiResponse = await fetchApi(
      `/admin/classroom/show-all`
    );
    setDataClass(getAllClass.data ?? []);
    console.log(getAllClass);
  };

  const fetchAllSection = async () => {
    const getListSection: ApiResponse<TLIstSection[]> = await fetchApi(
      `/admin/section/${selectedClass}/get-by-product`
    );
    setListSection(getListSection.data || []);
  };

  useEffect(() => {
    fetchAllClass();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchAllSection();
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
            <Select
              onValueChange={(value) => {
                setSelectedSectionId(Number(value));
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>List Section</SelectLabel>
                  {listSection?.map((item: TLIstSection) => (
                    <SelectItem
                      key={item.id}
                      value={item.id.toString()}
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
        <Tabs defaultValue="participant">
          <TabsList>
            <TabsTrigger value="participant">Peserta</TabsTrigger>
            <TabsTrigger value="progress_module">Progres Modul</TabsTrigger>
            <TabsTrigger value="score_participant">Nilai Peserta</TabsTrigger>
            <TabsTrigger value="task">Nilai Tugas</TabsTrigger>
          </TabsList>
          <TabsContent value="score_participant">
            <ScoresParticipantComponent
              sectionId={selectedSectionId || null}
              selectedClass={selectedClass}
            />
          </TabsContent>
          <TabsContent value="participant">
            <ParticipantComponent selectedClass={selectedClass} />
          </TabsContent>
          <TabsContent value="progress_module">
            <ProgressParticipantComponent
              selectedClass={selectedClass}
              selectedSetion={selectedSectionId}
            />
          </TabsContent>
          <TabsContent value="task">
            <TaskParticipantComponent
              sectionId={selectedSectionId || null}
              selectedClass={selectedClass}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;

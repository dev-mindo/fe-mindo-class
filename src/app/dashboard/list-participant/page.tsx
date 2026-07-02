"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { useEffect, useState } from "react";
import { ParticipantComponent } from "./_component/Participant";
import { TaskParticipantComponent } from "./_component/TaskParticipant";
import { ProgressParticipantComponent } from "./_component/ProgressModule";
import { ScoresParticipantComponent } from "./_component/ScoresParticipant";
import { DashboardPageTitle } from "../_component/page-title";
import { useDashboardContext } from "@/context/DashboardContext";
import { canManageClassroom } from "@/lib/dashboard-permissions";

const Page = () => {
  const { user } = useDashboardContext();
  const canManage = canManageClassroom(user?.role);
  const [dataClass, setDataClass] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
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

  const selectedClassData = dataClass.find(
    (item: any) => item.id.toString() === selectedClass
  );
  const selectedSectionData = listSection.find(
    (item: TLIstSection) => item.id === selectedSectionId
  );

  return (
    <div className="w-full">
      <DashboardPageTitle title="Peserta" />
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Nama Kelas</p>
              <p className="mt-2 text-lg font-semibold">
                {selectedClassData?.title ?? "-"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Nama Section</p>
              <p className="mt-2 text-lg font-semibold">
                {selectedSectionData?.title ?? "-"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Jumlah Peserta</p>
              <p className="mt-2 text-lg font-semibold">
                {selectedClassData?._count?.userClass ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-between items-center my-4">
          <div className="flex gap-4">
            <Input placeholder="Cari Peserta" />
            <Select
              onValueChange={(value) => {
                setSelectedClass(value);
                setSelectedSectionId(null);
                setListSection([]);
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
            {canManage ? <Button>Tambah Kelas</Button> : null}
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

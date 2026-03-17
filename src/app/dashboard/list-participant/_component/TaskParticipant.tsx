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
import { ChatTask } from "./ChatTask";

type Props = {
  selectedClass: string | null;
  sectionId: number | null;
};

export const TaskParticipantComponent = ({
  selectedClass,
  sectionId,
}: Props) => {
  const [openChat, setOpenChat] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [dataParticipant, setDataParticipant] =
    useState<TModuleTypeGrade | null>(null);

  const fetchTaskByClassModule = async () => {
    const getTaskParticipant: ApiResponse<TModuleTypeGrade[]> = await fetchApi(
      `/admin/classroom/show-list-participant/${selectedClass}/module-type/${sectionId}/type/TASK`
    );

    setDataParticipant(
      getTaskParticipant.data && getTaskParticipant.data.length > 0
        ? getTaskParticipant.data[0]
        : null
    );
  };

  useEffect(() => {
    fetchTaskByClassModule();
  }, [sectionId]);

  return (
    <Table className="w-full">
      <TableCaption>List Kelas</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Judul Module</TableHead>
          <TableHead>Nama Peserta</TableHead>
          <TableHead>Upload Url</TableHead>
          <TableHead>Nilai</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dataParticipant?.data?.map((item: TModuleTaskParticipant) => (
          <TableRow key={item.userId}>
            <TableCell>{dataParticipant.moduleTitle}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>
              <Link href={item.uploadUrl || ""} target="_blank">
                {item.uploadUrl}
              </Link>
            </TableCell>
            <TableCell>{item.grade || 0}</TableCell>
            <TableCell>
              {(() => {
                switch (item.status) {
                  case "PENDING":
                    return "Menunggu";
                  case "SUBMITTED":
                    return "Sudah Mengumpulkan";
                  case "SUBMITTED_LATE":
                    return "Sudah Mengumpulkan Telat";
                  case "ASSESSED":
                    return "Sudah Dinilai";
                  default:
                    return "Menunggu";
                }
              })()}
            </TableCell>
            <TableCell className="max-w-fit flex items-center gap-2">
              <Button
                className=""
                onClick={() => {
                  setOpenChat(true);
                  setUsername(item.name);
                  // router.push(
                  //   `/dashboard/list-participant/${selectedClass}/detail/${item.userId}`
                  // );
                }}
              >
                Chat
              </Button>
              <Button
                className=""
                onClick={() => {
                  // router.push(
                  //   `/dashboard/list-participant/${selectedClass}/detail/${item.userId}`
                  // );
                }}
              >
                Detail
              </Button>
            </TableCell>
          </TableRow>
        ))}
        <ChatTask isOpen={openChat} username={username} setIsOpenDialog={setOpenChat}></ChatTask>
      </TableBody>
    </Table>
  );
};

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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  selectedClass: string | null;
};

export const ParticipantComponent = ({ selectedClass }: Props) => {
  const router = useRouter();
  const [dataParticipant, setDataParticipant] = useState<any[]>([]);
  
  const fetchParticipantByClassModule = async () => {
    const getAllParticipant: ApiResponse = await fetchApi(
      `/admin/classroom/show-list-participant/${selectedClass}`
    );
    console.log(getAllParticipant);
    setDataParticipant(getAllParticipant.data ?? []);
  };

  useEffect(() => {
    fetchParticipantByClassModule();
  }, [selectedClass]);

  return (
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
              <Button
                className=""
                onClick={() => {
                  router.push(
                    `/dashboard/list-participant/${selectedClass}/detail/${item.userId}`
                  );
                }}
              >
                Detail
              </Button>
              <Button className="bg-yellow-500">Edit</Button>
              <Button className="bg-red-500">Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

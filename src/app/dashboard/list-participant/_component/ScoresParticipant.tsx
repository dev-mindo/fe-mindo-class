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
import { useEffect, useState } from "react";

type Props = {
  selectedClass: string | null;
  sectionId: number | null;
};

export const ScoresParticipantComponent = ({
  selectedClass,
  sectionId,
}: Props) => {
  const [dataScoreParticipant, setDataScoreParticipant] = useState<
    TScoreList[]
  >([]);

  const fetchScoresByClassModule = async () => {
    const getScore: ApiResponse<TScoreList[]> = await fetchApi(
      `/admin/classroom/show-list-participant/${selectedClass}/participant-score/${sectionId}`
    );

    setDataScoreParticipant(getScore.data || []);
  };

  useEffect(() => {
    fetchScoresByClassModule();
  }, []);

  return (
    <Table className="w-full">
      <TableCaption>List Kelas</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Peserta</TableHead>
          {dataScoreParticipant.at(0)?.modules.map((moduleItem) => (
            <TableHead>{moduleItem.title}</TableHead>
          ))}
          <TableHead>Total Score</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dataScoreParticipant?.map((item: TScoreList) => (
          <TableRow key={item.userId}>
            <TableCell>{item.name}</TableCell>
            {item.modules.map((moduleItem) => (
              <TableCell>{moduleItem.score}</TableCell>
            ))}
            <TableCell>{item.totalScore}</TableCell>
            {/* <TableCell> */}
              {/* {item.isCertificateEligible ? "Sudah" : "Belum"} */}
            {/* </TableCell> */}
            {/* <TableCell className="max-w-fit flex items-center gap-2">
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
            </TableCell> */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

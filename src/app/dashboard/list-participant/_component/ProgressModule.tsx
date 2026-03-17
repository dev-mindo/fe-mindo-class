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
  selectedSetion: number | null;
};

export const ProgressParticipantComponent = ({
  selectedClass,
  selectedSetion,
}: Props) => {
  const router = useRouter();
  const [dataProgress, setDataProgress] = useState<TDTModuleProgress[]>([]);
  const [dataModule, setDataModule] = useState<TListModuleBySection[]>([]);

  const fetchProgressByClassModule = async () => {
    const getDataProgressModuleParticipant: ApiResponse<TDTModuleProgress[]> =
      await fetchApi(
        `/admin/classroom/show-list-participant/${selectedClass}/module/${selectedSetion}`
      );

    setDataProgress(getDataProgressModuleParticipant.data || []);
  };

  const fetchModuleBySectionId = async () => {
    const getModuleBySection: ApiResponse<TListModuleBySection[]> =
      await fetchApi(`/admin/module/get-by-section/${selectedSetion}`);

    setDataModule(getModuleBySection.data || []);
  };

  useEffect(() => {
    if (selectedClass && selectedSetion) {
      fetchProgressByClassModule();
      fetchModuleBySectionId();
    }
  }, [selectedSetion]);

  return (
    <Table className="w-full">
      <TableCaption>List Kelas</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Peserta</TableHead>
          <TableHead>Progress</TableHead>
          {dataModule.map((moduleItem) => (
            <TableHead>{moduleItem.title}</TableHead>
          ))}
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dataProgress?.map((item: TDTModuleProgress) => (
          <TableRow key={item.userId}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.progress}</TableCell>
            {item.moduleProgress.map((progressItem) => (
              <TableCell>
                {(() => {
                  switch (progressItem.status) {
                    case "DONE":
                      return <>Sudah</>;
                    case "NOT_TAKEN":
                      return <>Belum</>;
                    default:
                      return <>Belum</>;
                  }
                })()}
              </TableCell>
            ))}
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

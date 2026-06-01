import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
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

type Props = {
  selectedClass: string | null;
};

const pageSize = 5;

const getPaginationPages = (currentPage: number, totalPage: number) => {
  const maxVisiblePage = 5;
  const halfVisiblePage = Math.floor(maxVisiblePage / 2);
  const startPage = Math.max(1, currentPage - halfVisiblePage);
  const endPage = Math.min(totalPage, startPage + maxVisiblePage - 1);
  const adjustedStartPage = Math.max(1, endPage - maxVisiblePage + 1);

  return Array.from(
    { length: endPage - adjustedStartPage + 1 },
    (_, index) => adjustedStartPage + index
  );
};

export const ParticipantComponent = ({ selectedClass }: Props) => {
  const router = useRouter();
  const [dataParticipant, setDataParticipant] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [certificateFilter, setCertificateFilter] = useState<
    "all" | "eligible" | "not_eligible"
  >("all");

  const fetchParticipantByClassModule = async () => {
    if (!selectedClass) {
      setDataParticipant([]);
      return;
    }

    const getAllParticipant: ApiResponse = await fetchApi(
      `/admin/classroom/show-list-participant/${selectedClass}`
    );
    console.log(getAllParticipant);
    setDataParticipant(getAllParticipant.data ?? []);
  };

  useEffect(() => {
    fetchParticipantByClassModule();
    setCurrentPage(1);
  }, [selectedClass]);

  const filteredParticipant = dataParticipant.filter((participant) => {
    const searchValue = search.trim().toLowerCase();
    const matchSearch = searchValue
      ? String(participant.name || "")
          .toLowerCase()
          .includes(searchValue)
      : true;
    const matchCertificate =
      certificateFilter === "all"
        ? true
        : certificateFilter === "eligible"
          ? Boolean(participant.isCertificateEligible)
          : !participant.isCertificateEligible;

    return matchSearch && matchCertificate;
  });
  const totalPage = Math.max(1, Math.ceil(filteredParticipant.length / pageSize));
  const paginatedParticipant = filteredParticipant.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const paginationPages = getPaginationPages(currentPage, totalPage);

  useEffect(() => {
    if (currentPage > totalPage) setCurrentPage(totalPage);
  }, [currentPage, totalPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, certificateFilter]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          className="md:max-w-sm"
          placeholder="Cari nama peserta..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select
          value={certificateFilter}
          onValueChange={(value) =>
            setCertificateFilter(
              value as "all" | "eligible" | "not_eligible"
            )
          }
        >
          <SelectTrigger className="md:w-[240px]">
            <SelectValue placeholder="Filter sertifikat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Sertifikat</SelectItem>
            <SelectItem value="eligible">Sudah Mendapat Sertifikat</SelectItem>
            <SelectItem value="not_eligible">
              Belum Mendapat Sertifikat
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table className="w-full">
        <TableCaption>List Peserta</TableCaption>
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
          {paginatedParticipant?.map((item: any) => (
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
          {paginatedParticipant.length === 0 ? (
            <TableRow>
              <TableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={5}
              >
                Peserta tidak ditemukan
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan {paginatedParticipant.length} dari{" "}
          {filteredParticipant.length} peserta
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {paginationPages.map((page) => (
              <Button
                key={page}
                type="button"
                size="icon"
                variant={page === currentPage ? "default" : "secondary"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={currentPage === totalPage}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

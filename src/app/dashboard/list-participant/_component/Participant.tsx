import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2, Minus, Plus, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { useDashboardContext } from "@/context/DashboardContext";
import { canManageClassroom } from "@/lib/dashboard-permissions";

type Props = {
  selectedClass: string | null;
};

const pageSize = 5;

type AvailableParticipant = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
};

type UserApiResponse = {
  errorCode: number;
  message: string;
  error: unknown;
  statusCode: number;
  data:
    | {
        results: AvailableParticipant[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrevious: boolean;
      }
    | AvailableParticipant[];
  results?: AvailableParticipant[];
  total?: number;
  page?: number;
  limit?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
};

type NormalizedUserApiResponse = {
  results: AvailableParticipant[];
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

const normalizeAvailableParticipant = (participant: any): AvailableParticipant => ({
  id: String(participant.id ?? participant.userId ?? ""),
  name: participant.name ?? "-",
  username: participant.username ?? "",
  email: participant.email ?? "",
  role: participant.role ?? "",
  status: participant.status ?? "",
});

const normalizeUserApiResponse = (
  result: UserApiResponse
): NormalizedUserApiResponse => {
  if (Array.isArray(result.data)) {
    const participants = result.data.map(normalizeAvailableParticipant);

    return {
      results: participants,
      total: result.total ?? participants.length,
      hasNext: Boolean(result.hasNext),
      hasPrevious: Boolean(result.hasPrevious),
    };
  }

  if (Array.isArray(result.data?.results)) {
    const participants = result.data.results.map(normalizeAvailableParticipant);

    return {
      results: participants,
      total: result.data.total ?? participants.length,
      hasNext: Boolean(result.data.hasNext),
      hasPrevious: Boolean(result.data.hasPrevious),
    };
  }

  if (Array.isArray(result.results)) {
    const participants = result.results.map(normalizeAvailableParticipant);

    return {
      results: participants,
      total: result.total ?? participants.length,
      hasNext: Boolean(result.hasNext),
      hasPrevious: Boolean(result.hasPrevious),
    };
  }

  const nestedData = (result.data as any)?.data;

  if (Array.isArray(nestedData?.results)) {
    const participants = nestedData.results.map(normalizeAvailableParticipant);

    return {
      results: participants,
      total: nestedData.total ?? participants.length,
      hasNext: Boolean(nestedData.hasNext),
      hasPrevious: Boolean(nestedData.hasPrevious),
    };
  }

  return {
    results: [],
    total: 0,
    hasNext: false,
    hasPrevious: false,
  };
};

const normalizeParticipantId = (participant: any) =>
  String(participant.userId ?? participant.id);

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

const getTodayDate = () => {
  const date = new Date();
  const timezoneOffset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

export const ParticipantComponent = ({ selectedClass }: Props) => {
  const router = useRouter();
  const { user } = useDashboardContext();
  const canManage = canManageClassroom(user?.role);
  const [dataParticipant, setDataParticipant] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [certificateFilter, setCertificateFilter] = useState<
    "all" | "eligible" | "not_eligible"
  >("all");
  const [showAddParticipantDialog, setShowAddParticipantDialog] =
    useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<
    AvailableParticipant[]
  >([]);
  const [participantSearch, setParticipantSearch] = useState("");
  const [participantOrderBy, setParticipantOrderBy] = useState<
    "latest" | "oldest"
  >("latest");
  const [availableParticipants, setAvailableParticipants] = useState<
    AvailableParticipant[]
  >([]);
  const [participantPage, setParticipantPage] = useState(1);
  const [participantTotal, setParticipantTotal] = useState(0);
  const [participantHasNext, setParticipantHasNext] = useState(false);
  const [participantHasPrevious, setParticipantHasPrevious] = useState(false);
  const [isLoadingAvailableParticipants, setIsLoadingAvailableParticipants] =
    useState(false);
  const [isSavingParticipants, setIsSavingParticipants] = useState(false);
  const [participantError, setParticipantError] = useState("");
  const [deletingParticipant, setDeletingParticipant] = useState<any | null>(
    null
  );
  const [isDeletingParticipant, setIsDeletingParticipant] = useState(false);

  const fetchParticipantByClassModule = async () => {
    if (!selectedClass) {
      setDataParticipant([]);
      return [];
    }

    const getAllParticipant: ApiResponse = await fetchApi(
      `/admin/classroom/show-list-participant/${selectedClass}`
    );
    console.log(getAllParticipant);
    const participants = getAllParticipant.data ?? [];

    setDataParticipant(participants);
    return participants;
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

  useEffect(() => {
    if (!showAddParticipantDialog) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoadingAvailableParticipants(true);
      setParticipantError("");

      const query = new URLSearchParams({
        page: String(participantPage),
        limit: String(pageSize),
        orderBy: participantOrderBy,
      });

      if (participantSearch.trim()) {
        query.set("search", participantSearch.trim());
      }

      try {
        const response = await fetch(`/api/users?${query.toString()}`, {          
          signal: controller.signal,
          cache: "no-store",
        });
        const result: UserApiResponse = await response.json();

        if (!response.ok || result.statusCode !== 200) {
          throw new Error(result.message || "Gagal mengambil daftar peserta");
        }

        const normalized = normalizeUserApiResponse(result);

        console.log("[available-participants]", {
          total: normalized.total,
          shown: normalized.results.length,
          first: normalized.results[0],
        });

        setAvailableParticipants(normalized.results);
        setParticipantTotal(normalized.total);
        setParticipantHasNext(normalized.hasNext);
        setParticipantHasPrevious(normalized.hasPrevious);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setAvailableParticipants([]);
        setParticipantTotal(0);
        setParticipantHasNext(false);
        setParticipantHasPrevious(false);
        setParticipantError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil daftar peserta"
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingAvailableParticipants(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [
    participantOrderBy,
    participantPage,
    participantSearch,
    showAddParticipantDialog,
  ]);

  const participantTotalPages = Math.max(
    1,
    Math.ceil(participantTotal / pageSize)
  );
  const participantPaginationPages = getPaginationPages(
    participantPage,
    participantTotalPages
  );

  const selectedParticipantIds = new Set(
    selectedParticipants.map(normalizeParticipantId)
  );
  const registeredParticipantIds = new Set(
    dataParticipant.map(normalizeParticipantId)
  );
  const filteredAvailableParticipants = availableParticipants.filter(
    (participant) =>
      !selectedParticipantIds.has(normalizeParticipantId(participant))
  );
  const addParticipant = (participant: AvailableParticipant) => {
    setSelectedParticipants((current) => [...current, participant]);
  };
  const removeParticipant = (participantId: string) => {
    setSelectedParticipants((current) =>
      current.filter((participant) => participant.id !== participantId)
    );
  };
  const handleSaveParticipants = async () => {
    if (!canManage) {
      toast.error("Anda tidak memiliki akses untuk menambah peserta");
      return;
    }

    const productId = Number(selectedClass);

    if (!Number.isInteger(productId) || productId < 1) {
      toast.error("Product ID kelas tidak valid");
      return;
    }

    const data = selectedParticipants
      .map((participant) => ({
        productId,
        userId: Number(participant.id),
        name: participant.name,
        classDate: getTodayDate(),
      }))
      .filter((participant) => Number.isInteger(participant.userId));

    if (data.length !== selectedParticipants.length) {
      toast.error("Ada peserta dengan User ID tidak valid");
      return;
    }

    console.log('data', data)

    setIsSavingParticipants(true);

    const response: ApiResponse = await fetchApi(
      "/admin/classroom/participants",
      {
        method: "POST",
        body: { data },
      }
    );

    console.log('response', response)

    setIsSavingParticipants(false);

    if (response.statusCode !== 200 && response.statusCode !== 201) {
      toast.error(response.message || "Gagal menambahkan peserta");
      return;
    }

    const addedParticipants = selectedParticipants.map((participant) => ({
      userId: Number(participant.id),
      name: participant.name,
      progress: 0,
      totalScore: 0,
      isCertificateEligible: false,
    }));

    setSearch("");
    setCertificateFilter("all");
    setCurrentPage(1);
    setDataParticipant((current) => {
      const existingIds = new Set(current.map(normalizeParticipantId));
      const newParticipants = addedParticipants.filter(
        (participant) => !existingIds.has(normalizeParticipantId(participant))
      );

      return [...newParticipants, ...current];
    });

    toast.success(response.message || "Peserta berhasil ditambahkan ke kelas");
    handleAddParticipantDialogChange(false);
    const latestParticipants = await fetchParticipantByClassModule();
    const latestIds = new Set(latestParticipants.map(normalizeParticipantId));

    if (
      addedParticipants.some(
        (participant) => !latestIds.has(normalizeParticipantId(participant))
      )
    ) {
      setDataParticipant((current) => {
        const existingIds = new Set(current.map(normalizeParticipantId));
        const missingParticipants = addedParticipants.filter(
          (participant) => !existingIds.has(normalizeParticipantId(participant))
        );

        return [...missingParticipants, ...current];
      });
    }
  };

  const handleAddParticipantDialogChange = (open: boolean) => {
    setShowAddParticipantDialog(open);

    if (open) {
      setAvailableParticipants([]);
      setParticipantSearch("");
      setParticipantOrderBy("latest");
      setParticipantPage(1);
      setParticipantError("");
    }

    if (!open) {
      setSelectedParticipants([]);
      setParticipantSearch("");
      setParticipantOrderBy("latest");
      setParticipantPage(1);
      setParticipantError("");
    }
  };

  const handleDeleteParticipant = async () => {
    if (!canManage) {
      toast.error("Anda tidak memiliki akses untuk menghapus peserta");
      return;
    }

    const productId = Number(selectedClass);
    const userId = Number(
      deletingParticipant?.userId ?? deletingParticipant?.id
    );

    if (!Number.isInteger(productId) || productId < 1) {
      toast.error("Product ID kelas tidak valid");
      return;
    }

    if (!Number.isInteger(userId) || userId < 1) {
      toast.error("User ID peserta tidak valid");
      return;
    }

    setIsDeletingParticipant(true);

    const response: ApiResponse = await fetchApi(
      `/admin/classroom/${productId}/${userId}`,
      {
        method: "DELETE",
      }
    );

    setIsDeletingParticipant(false);

    if (
      typeof response.statusCode !== "number" ||
      response.statusCode < 200 ||
      response.statusCode >= 300
    ) {
      toast.error(response.message || "Gagal menghapus peserta dari kelas");
      return;
    }

    toast.success(
      response.message || "Peserta berhasil dihapus dari kelas"
    );
    setDeletingParticipant(null);
    await fetchParticipantByClassModule();
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          className="md:max-w-sm"
          placeholder="Cari nama peserta..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
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
              <SelectItem value="eligible">
                Sudah Mendapat Sertifikat
              </SelectItem>
              <SelectItem value="not_eligible">
                Belum Mendapat Sertifikat
              </SelectItem>
            </SelectContent>
          </Select>
          {canManage ? (
            <Button
              onClick={() => handleAddParticipantDialogChange(true)}
              type="button"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah Peserta
            </Button>
          ) : null}
        </div>
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
                {canManage ? (
                  <>
                    <Button className="bg-yellow-500">Edit</Button>
                    <Button
                      onClick={() => setDeletingParticipant(item)}
                      type="button"
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </>
                ) : null}
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
      {canManage ? (
        <Dialog
          open={showAddParticipantDialog}
          onOpenChange={handleAddParticipantDialogChange}
        >
        <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-6xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-5 pr-12">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Tambah Peserta Kelas</DialogTitle>
                <DialogDescription className="mt-1">
                  Pilih peserta dari tabel kiri untuk dimasukkan ke kelas.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 p-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="overflow-hidden rounded-lg border bg-background">
                <div className="border-b p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">Daftar Peserta</h3>
                      <p className="text-xs text-muted-foreground">
                        {participantTotal} peserta ditemukan
                      </p>
                    </div>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px]">
                    <Input
                      onChange={(event) => {
                        setParticipantSearch(event.target.value);
                        setParticipantPage(1);
                      }}
                      placeholder="Cari nama, username, atau email..."
                      value={participantSearch}
                    />
                    <Select
                      value={participantOrderBy}
                      onValueChange={(value) => {
                        setParticipantOrderBy(
                          value as "latest" | "oldest"
                        );
                        setParticipantPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Urutkan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">Terbaru</SelectItem>
                        <SelectItem value="oldest">Terlama</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="max-h-[420px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Peserta</TableHead>
                        <TableHead className="w-16 text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingAvailableParticipants ? (
                        <TableRow>
                          <TableCell
                            className="h-32 text-center text-muted-foreground"
                            colSpan={2}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Memuat peserta...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null}
                      {!isLoadingAvailableParticipants &&
                        filteredAvailableParticipants.map((participant) => {
                          const isRegistered = registeredParticipantIds.has(
                            normalizeParticipantId(participant)
                          );

                          return (
                            <TableRow key={participant.id}>
                              <TableCell>
                                <p className="font-medium">
                                  {participant.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {participant.username || participant.email}
                                  {participant.username && participant.email
                                    ? ` - ${participant.email}`
                                    : ""}
                                </p>
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  aria-label={
                                    isRegistered
                                      ? `${participant.name} sudah terdaftar`
                                      : `Tambah ${participant.name}`
                                  }
                                  disabled={isRegistered}
                                  onClick={() => addParticipant(participant)}
                                  size={isRegistered ? "sm" : "icon"}
                                  type="button"
                                  variant={
                                    isRegistered ? "secondary" : "default"
                                  }
                                >
                                  {isRegistered ? (
                                    "Terdaftar"
                                  ) : (
                                    <Plus className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      {!isLoadingAvailableParticipants &&
                      filteredAvailableParticipants.length === 0 ? (
                        <TableRow>
                          <TableCell
                            className="h-24 text-center text-muted-foreground"
                            colSpan={2}
                          >
                            {participantError || "Peserta tidak ditemukan"}
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex flex-col gap-3 border-t p-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Halaman {participantPage} dari {participantTotalPages}
                  </p>
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={
                        isLoadingAvailableParticipants ||
                        !participantHasPrevious
                      }
                      onClick={() =>
                        setParticipantPage((page) => Math.max(1, page - 1))
                      }
                    >
                      Previous
                    </Button>
                    {participantPaginationPages.map((page) => (
                      <Button
                        key={page}
                        type="button"
                        size="icon"
                        variant={
                          page === participantPage ? "default" : "outline"
                        }
                        disabled={isLoadingAvailableParticipants}
                        aria-label={`Halaman ${page}`}
                        aria-current={
                          page === participantPage ? "page" : undefined
                        }
                        onClick={() => setParticipantPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={
                        isLoadingAvailableParticipants || !participantHasNext
                      }
                      onClick={() =>
                        setParticipantPage((page) => page + 1)
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border bg-background">
                <div className="flex items-center justify-between gap-3 border-b p-4">
                  <div>
                    <h3 className="font-semibold">Peserta Terpilih</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedParticipants.length} peserta akan masuk kelas
                    </p>
                  </div>
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div className="max-h-[474px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Peserta</TableHead>
                        <TableHead className="w-16 text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedParticipants.map((participant) => (
                        <TableRow key={participant.id}>
                          <TableCell>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {participant.email}
                            </p>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              aria-label={`Hapus ${participant.name}`}
                              onClick={() => removeParticipant(participant.id)}
                              size="icon"
                              type="button"
                              variant="destructive"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {selectedParticipants.length === 0 ? (
                        <TableRow>
                          <TableCell
                            className="h-24 text-center text-muted-foreground"
                            colSpan={2}
                          >
                            Belum ada peserta dipilih
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t bg-background px-6 py-4">
            <Button
              onClick={() => handleAddParticipantDialogChange(false)}
              type="button"
              variant="outline"
            >
              Batal
            </Button>
            <Button
              disabled={
                selectedParticipants.length === 0 || isSavingParticipants
              }
              onClick={handleSaveParticipants}
              type="button"
            >
              {isSavingParticipants
                ? "Menambahkan..."
                : `Tambahkan ${selectedParticipants.length} Peserta`}
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
      ) : null}
      {canManage ? (
        <AlertDialog
          open={Boolean(deletingParticipant)}
          onOpenChange={(open) => {
            if (!open && !isDeletingParticipant) {
              setDeletingParticipant(null);
            }
          }}
        >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus peserta dari kelas?</AlertDialogTitle>
            <AlertDialogDescription>
              Peserta {deletingParticipant?.name || "ini"} akan dihapus dari
              kelas. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingParticipant}>
              Batal
            </AlertDialogCancel>
            <Button
              disabled={isDeletingParticipant}
              onClick={handleDeleteParticipant}
              type="button"
              variant="destructive"
            >
              {isDeletingParticipant ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
};

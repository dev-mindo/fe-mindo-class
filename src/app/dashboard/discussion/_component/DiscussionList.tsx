"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  Loader2,
  MessageSquare,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";

type Classroom = {
  id: number;
  title: string;
};

type DiscussionStatus = "ALL" | "OPEN" | "CLOSED";

const pageSize = 5;

export const DiscussionList = () => {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [sections, setSections] = useState<TDiscussionSection>([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [discussions, setDiscussions] = useState<TModuleDiscussion>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<DiscussionStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [openingDiscussionId, setOpeningDiscussionId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const loadClassrooms = async () => {
      setLoadingClassrooms(true);
      const response: ApiResponse<Classroom[]> = await fetchApi(
        "/admin/classroom/show-all"
      );
      setClassrooms(response.data ?? []);
      setLoadingClassrooms(false);
    };

    loadClassrooms();
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setSections([]);
      setSelectedModuleId("");
      setDiscussions([]);
      return;
    }

    const loadModules = async () => {
      setLoadingModules(true);
      setSections([]);
      setSelectedModuleId("");
      setDiscussions([]);

      const response: ApiResponse<TDiscussionSection> = await fetchApi(
        `/admin/discussion/show-by-class/${selectedClass}`
      );
      const nextSections = response.data ?? [];

      setSections(nextSections);
      setSelectedModuleId(
        nextSections
          .flatMap((section) => section.module)
          .at(0)
          ?.id.toString() ?? ""
      );
      setLoadingModules(false);
    };

    loadModules();
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedModuleId) {
      setDiscussions([]);
      return;
    }

    const loadDiscussions = async () => {
      setLoadingDiscussions(true);
      const response: ApiResponse<TModuleDiscussion> = await fetchApi(
        `/admin/discussion/show-by-module/${selectedModuleId}`
      );
      setDiscussions(response.data ?? []);
      setLoadingDiscussions(false);
    };

    loadDiscussions();
  }, [selectedModuleId]);

  const selectedModule = useMemo(
    () =>
      sections
        .flatMap((section) =>
          section.module.map((module) => ({
            ...module,
            sectionTitle: section.title,
          }))
        )
        .find((module) => module.id.toString() === selectedModuleId),
    [sections, selectedModuleId]
  );

  const filteredDiscussions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return discussions.filter((discussion) => {
      const matchesSearch =
        discussion.title.toLowerCase().includes(keyword) ||
        discussion.user?.name?.toLowerCase().includes(keyword);
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "OPEN" && discussion.status) ||
        (statusFilter === "CLOSED" && !discussion.status);

      return matchesSearch && matchesStatus;
    });
  }, [discussions, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDiscussions.length / pageSize)
  );
  const paginatedDiscussions = filteredDiscussions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, selectedModuleId]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));

  const openDiscussion = (id: number) => {
    setOpeningDiscussionId(id);
    router.push(`/dashboard/discussion/${id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Pengelolaan Diskusi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih kelas dan modul untuk memantau diskusi peserta.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5 text-primary" />
              Kelas dan Modul
            </CardTitle>
            <CardDescription>
              Pilih modul untuk menampilkan daftar diskusi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Select
              value={selectedClass}
              disabled={loadingClassrooms}
              onValueChange={setSelectedClass}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingClassrooms ? "Memuat kelas..." : "Pilih kelas"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {classrooms.map((classroom) => (
                  <SelectItem
                    key={classroom.id}
                    value={classroom.id.toString()}
                  >
                    {classroom.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!selectedClass ? (
              <EmptyState
                icon={<BookOpen className="h-5 w-5" />}
                title="Belum ada kelas dipilih"
                description="Pilih kelas terlebih dahulu untuk melihat modul."
              />
            ) : loadingModules ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 w-full" />
                ))}
              </div>
            ) : sections.length ? (
              <div className="max-h-[520px] space-y-5 overflow-y-auto pr-1">
                {sections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {section.title}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {section.module.length} modul
                      </span>
                    </div>
                    <div className="space-y-2">
                      {section.module.map((module) => {
                        const isActive =
                          selectedModuleId === module.id.toString();

                        return (
                          <button
                            key={module.id}
                            type="button"
                            onClick={() =>
                              setSelectedModuleId(module.id.toString())
                            }
                            className={`w-full rounded-lg border p-3 text-left transition-colors ${
                              isActive
                                ? "border-primary bg-primary/5"
                                : "bg-background hover:bg-muted/60"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {module.title}
                                </p>
                                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <MessageSquare className="h-3.5 w-3.5" />
                                  {module._count.discussion} diskusi
                                </div>
                              </div>
                              <ChevronRight
                                className={`mt-0.5 h-4 w-4 shrink-0 ${
                                  isActive
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<BookOpen className="h-5 w-5" />}
                title="Modul tidak ditemukan"
                description="Kelas ini belum memiliki modul diskusi."
              />
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
            <div className="min-w-0">
              <CardTitle className="truncate">
                {selectedModule?.title ?? "Daftar Diskusi"}
              </CardTitle>
              <CardDescription className="mt-1.5">
                {selectedModule
                  ? `${selectedModule.sectionTitle} - ${discussions.length} diskusi`
                  : "Pilih modul untuk menampilkan diskusi"}
              </CardDescription>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <div className="relative sm:min-w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Cari judul atau peserta..."
                  disabled={!selectedModuleId}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                disabled={!selectedModuleId}
                onValueChange={(value) =>
                  setStatusFilter(value as DiscussionStatus)
                }
              >
                <SelectTrigger className="sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="CLOSED">Close</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {!selectedModuleId ? (
              <EmptyState
                className="min-h-80"
                icon={<MessageSquare className="h-6 w-6" />}
                title="Pilih modul"
                description="Daftar diskusi akan ditampilkan setelah modul dipilih."
              />
            ) : loadingDiscussions ? (
              <DiscussionTableSkeleton />
            ) : (
              <>
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Diskusi</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Peserta
                        </TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Tanggapan
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-24 text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedDiscussions.map((discussion) => (
                        <TableRow key={discussion.id}>
                          <TableCell>
                            <div className="max-w-md">
                              <p className="line-clamp-1 font-medium">
                                {discussion.title}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatDate(discussion.createdAt)}
                                <span className="md:hidden">
                                  {" "}
                                  · {discussion.user?.name ?? "-"}
                                </span>
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {discussion.user?.name ?? "-"}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="inline-flex items-center gap-1.5">
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              {discussion._count.discussionAnswer}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                discussion.status ? "default" : "secondary"
                              }
                            >
                              {discussion.status ? "Open" : "Close"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              disabled={openingDiscussionId !== null}
                              onClick={() => openDiscussion(discussion.id)}
                            >
                              {openingDiscussionId === discussion.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Detail"
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}

                      {!paginatedDiscussions.length && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="h-40 text-center text-muted-foreground"
                          >
                            Diskusi tidak ditemukan.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan {paginatedDiscussions.length} dari{" "}
                    {filteredDiscussions.length} diskusi
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((page) => page - 1)}
                    >
                      Previous
                    </Button>
                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((page) => (
                      <Button
                        key={page}
                        type="button"
                        size="sm"
                        variant={page === currentPage ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((page) => page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
};

const EmptyState = ({
  icon,
  title,
  description,
  className = "",
}: EmptyStateProps) => (
  <div
    className={`flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center ${className}`}
  >
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
      {icon}
    </div>
    <p className="text-sm font-medium">{title}</p>
    <p className="mt-1 max-w-xs text-xs text-muted-foreground">
      {description}
    </p>
  </div>
);

const DiscussionTableSkeleton = () => (
  <div className="space-y-3 rounded-lg border p-4">
    <Skeleton className="h-10 w-full" />
    {Array.from({ length: pageSize }).map((_, index) => (
      <Skeleton key={index} className="h-14 w-full" />
    ))}
  </div>
);

"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import parse from "html-react-parser";
import {
  CalendarClock,
  ExternalLink,
  FileText,
  Info,
  Link2,
} from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  assignment: TAssignment | undefined;
  intruction: string | undefined;
  intructionLink: TFile[] | undefined;
};

export const Task = ({ intructionLink, intruction, assignment }: Props) => {
  const [collectionAssignment, setCollectionAssignment] =
    useState<TTaskUser | null>(null);
  const [editTask, setEditTask] = useState<boolean>(false);
  const [task, setTask] = useState<string>("");
  const [isLate, setIsLate] = useState<boolean>(false);

  const submittedAt = collectionAssignment?.createdAt
    ? moment(collectionAssignment.createdAt).format("LLLL")
    : "Belum mengumpulkan";
  const deadline = assignment?.endAt
    ? moment(assignment.endAt).format("DD MMMM YYYY, HH:mm")
    : "-";
  const canSubmit = !isLate;
  const canEditSubmission =
    Boolean(assignment?.editable) && Boolean(collectionAssignment) && canSubmit;

  const submissionStatus = collectionAssignment
    ? collectionAssignment.status === "SUBMITTED"
      ? "Sudah Mengumpulkan"
      : collectionAssignment.status === "SUBMITTED_LATE"
      ? "Sudah Mengumpulkan (Terlambat)"
      : collectionAssignment.status === "ASSESSED"
      ? "Dinilai"
      : "Belum Mengumpulkan"
    : "Belum Mengumpulkan";

  const statusBadgeVariant = collectionAssignment
    ? collectionAssignment.status === "ASSESSED"
      ? "default"
      : collectionAssignment.status === "SUBMITTED_LATE"
      ? "destructive"
      : "secondary"
    : "outline";

  const handleEditTask = () => {
    if (!editTask) setEditTask(true);
  };

  const handleSaveTask = async () => {
    if (!assignment?.id) {
      toast.error("Data tugas tidak ditemukan");
      return;
    }

    if (!task.trim()) {
      toast.error("URL tugas wajib diisi");
      return;
    }

    await fetchApi<ApiResponse<TTaskUser>>(`/assignment/${assignment.id}/save`, {
      method: "POST",
      body: {
        uploadUrl: task.trim(),
      },
    })
      .then((userTask) => {
        if (userTask) {
          if (!userTask.success) {
            toast.error(userTask.message);
          } else {
            setEditTask(false);
            setCollectionAssignment(userTask.data ?? null);
            toast.success("Tugas berhasil disimpan");
          }
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Gagal menyimpan tugas");
      });
  };

  useEffect(() => {
    const checkLate = assignment
      ? new Date() > new Date(assignment.endAt) && !assignment.canLate
      : false;
    const existingTask = assignment?.taskUser.at(0) || null;

    setIsLate(checkLate);
    setCollectionAssignment(existingTask);
    setTask(existingTask?.uploadUrl || "");
    setEditTask(!existingTask && !checkLate);
  }, [assignment]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="gap-2 pb-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xl">
                  Instruksi Pengumpulan
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Baca instruksi sebelum mengirimkan tautan tugas.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="prose prose-sm max-w-none text-foreground prose-p:my-2 prose-ul:my-2 prose-ol:my-2">
              {intruction ? parse(intruction) : "Tidak ada instruksi"}
            </div>

            {intructionLink && intructionLink.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm font-medium">Lampiran</div>
                <div className="flex flex-wrap gap-2">
                  {intructionLink.map((item, index) => (
                    <Button key={index} asChild variant="outline" size="sm">
                      <a href={item.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        {item.name}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Alert
            className={cn(
              "rounded-lg",
              isLate && "border-destructive/50 text-destructive"
            )}
          >
            <Info className="h-4 w-4" />
            <AlertTitle>Info Deadline</AlertTitle>
            <AlertDescription className="mt-1">
              Batas waktu pengumpulan {deadline}
              {assignment?.canLate ? " (boleh terlambat)" : ""}
            </AlertDescription>
          </Alert>

          <Card className="rounded-lg shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={statusBadgeVariant}>{submissionStatus}</Badge>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  Tanggal kirim
                </span>
                <span className="max-w-[180px] text-right text-sm font-medium">
                  {submittedAt}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  Edit tugas
                </span>
                <span
                  className={cn(
                    "text-right text-sm font-medium",
                    (!assignment?.editable || isLate) && "text-destructive"
                  )}
                >
                  {isLate
                    ? "Ditutup"
                    : assignment?.editable
                    ? "Bisa diedit"
                    : "Tidak bisa diedit"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="rounded-lg shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Pengumpulan</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Masukkan URL tugas yang dapat diakses oleh pengajar.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              {deadline}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                disabled={!editTask || !canSubmit}
                onChange={(e) => setTask(e.target.value)}
                value={task}
                className="pl-9"
                placeholder="https://..."
              />
            </div>
            {editTask ? (
              <Button onClick={handleSaveTask} disabled={!canSubmit}>
                Simpan
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled={!canEditSubmission}
                onClick={handleEditTask}
              >
                Edit
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {isLate
              ? "Tugas sudah melewati batas waktu dan tidak dapat dikumpulkan."
              : assignment?.editable
              ? "Tugas dapat diperbarui selama pengumpulan masih dibuka."
              : "Tugas yang sudah dikirim tidak dapat diedit kembali."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

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
import { Badge } from "@/components/ui/badge";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Loader2,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SelectedQuizDetail } from "./types";
import { formatDateTime } from "./utils";

type Props = {
  selectedQuizDetail: SelectedQuizDetail | null;
  setSelectedQuizDetail: (detail: SelectedQuizDetail | null) => void;
  onAttemptDeleted: () => Promise<void>;
};

export const QuizDetailPanel = ({
  selectedQuizDetail,
  setSelectedQuizDetail,
  onAttemptDeleted,
}: Props) => {
  const [deletingAttemptId, setDeletingAttemptId] = useState<number | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const attempts = selectedQuizDetail?.attempts ?? [];
  const bestScore = attempts.length
    ? Math.max(...attempts.map((attempt) => Number(attempt.score ?? 0)))
    : 0;
  const latestAttempt = attempts.length
    ? attempts.reduce((latest, attempt) => {
        const latestTime = new Date(latest.startedAt).getTime();
        const attemptTime = new Date(attempt.startedAt).getTime();

        return attemptTime > latestTime ? attempt : latest;
      }, attempts[0])
    : null;

  const getStatusVariant = (status?: string) => {
    const normalizedStatus = status?.toUpperCase();

    if (
      normalizedStatus === "DONE" ||
      normalizedStatus === "COMPLETED" ||
      normalizedStatus === "FINISHED"
    ) {
      return "default" as const;
    }

    if (
      normalizedStatus === "ON_PROCESS" ||
      normalizedStatus === "PROCESS" ||
      normalizedStatus === "IN_PROGRESS"
    ) {
      return "secondary" as const;
    }

    return "outline" as const;
  };

  const handleDeleteAttempt = async () => {
    if (!deletingAttemptId || !selectedQuizDetail) return;

    setIsDeleting(true);

    try {
      const response: ApiResponse = await fetchApi(
        `/admin/quiz/attempt/${deletingAttemptId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.success) {
        toast.error(response.message || "Progress quiz gagal dihapus.");
        return;
      }

      setSelectedQuizDetail({
        ...selectedQuizDetail,
        attempts: selectedQuizDetail.attempts.filter(
          (attempt) => attempt.attemptId !== deletingAttemptId,
        ),
      });
      setDeletingAttemptId(null);
      await onAttemptDeleted();
      toast.success(response.message || "Progress quiz berhasil dihapus.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex max-h-[58%] min-h-0 shrink-0 flex-col border-t bg-muted/20 p-3">
      <div className="mb-3 flex shrink-0 items-start justify-between gap-3 rounded-lg border bg-background p-4 shadow-sm">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Trophy className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">Detail Quiz</h3>
              <p className="truncate text-xs text-muted-foreground">
                {selectedQuizDetail
                  ? `${selectedQuizDetail.name} - ${selectedQuizDetail.moduleTitle}`
                  : "Klik Detail pada salah satu peserta."}
              </p>
            </div>
          </div>
        </div>
        {selectedQuizDetail ? (
          <Button
            aria-label="Tutup detail quiz"
            className="h-8 w-8 shrink-0"
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setSelectedQuizDetail(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      {selectedQuizDetail ? (
        attempts.length ? (
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Total Attempt</p>
                <p className="mt-1 text-2xl font-semibold">
                  {attempts.length}
                </p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Score Terbaik</p>
                <p className="mt-1 text-2xl font-semibold">{bestScore}</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground">Status Terakhir</p>
                <Badge
                  className="mt-2"
                  variant={getStatusVariant(latestAttempt?.status)}
                >
                  {latestAttempt?.status || "-"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              {attempts.map((attempt, index) => (
                <div
                  key={attempt.attemptId}
                  className="rounded-lg border bg-background p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Attempt {index + 1}</Badge>
                        <Badge variant={getStatusVariant(attempt.status)}>
                          {attempt.status || "-"}
                        </Badge>
                      </div>
                      <h4 className="mt-2 truncate text-sm font-semibold">
                        {attempt.quizTitle}
                      </h4>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <div className="rounded-md bg-primary/10 px-3 py-2 text-right text-primary">
                        <p className="text-[10px] font-medium uppercase">
                          Score
                        </p>
                        <p className="text-lg font-semibold">
                          {attempt.score ?? "-"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        aria-label={`Hapus progress ${attempt.quizTitle}`}
                        onClick={() => setDeletingAttemptId(attempt.attemptId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2">
                      <Clock3 className="h-3.5 w-3.5" />
                      <span>Mulai: {formatDateTime(attempt.startedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2">
                      <CalendarClock className="h-3.5 w-3.5" />
                      <span>
                        Selesai: {formatDateTime(attempt.completeAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            <CheckCircle2 className="mx-auto mb-2 h-5 w-5" />
            Peserta belum memiliki attempt quiz pada module ini.
          </div>
        )
      ) : null}
      <AlertDialog
        open={deletingAttemptId !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeletingAttemptId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus progress quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Attempt quiz milik {selectedQuizDetail?.name || "peserta ini"} akan
              dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteAttempt}
            >
              {isDeleting ? (
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
    </div>
  );
};

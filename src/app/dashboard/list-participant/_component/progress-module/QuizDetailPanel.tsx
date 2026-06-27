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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { Loader2, Trash2 } from "lucide-react";
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
    <div className="shrink-0 border-t p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Detail Quiz</h3>
          <p className="text-xs text-muted-foreground">
            {selectedQuizDetail
              ? `${selectedQuizDetail.name} - ${selectedQuizDetail.moduleTitle}`
              : "Klik Detail pada salah satu peserta."}
          </p>
        </div>
        {selectedQuizDetail ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setSelectedQuizDetail(null)}
          >
            Close
          </Button>
        ) : null}
      </div>
      {selectedQuizDetail ? (
        selectedQuizDetail.attempts.length ? (
          <div className="max-h-[420px] overflow-y-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Mulai</TableHead>
                  <TableHead>Selesai</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedQuizDetail.attempts.map((attempt) => (
                  <TableRow key={attempt.attemptId}>
                    <TableCell>{attempt.quizTitle}</TableCell>
                    <TableCell>{attempt.score}</TableCell>
                    <TableCell>{formatDateTime(attempt.startedAt)}</TableCell>
                    <TableCell>{formatDateTime(attempt.completeAt)}</TableCell>
                    <TableCell>{attempt.status}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        aria-label={`Hapus progress ${attempt.quizTitle}`}
                        onClick={() => setDeletingAttemptId(attempt.attemptId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
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

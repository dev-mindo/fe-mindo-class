import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SelectedQuizDetail } from "./types";
import { formatDateTime } from "./utils";

type Props = {
  selectedQuizDetail: SelectedQuizDetail | null;
  setSelectedQuizDetail: (detail: SelectedQuizDetail | null) => void;
};

export const QuizDetailPanel = ({
  selectedQuizDetail,
  setSelectedQuizDetail,
}: Props) => {
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
    </div>
  );
};

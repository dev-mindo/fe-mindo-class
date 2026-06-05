import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ClipboardCheck, CircleDashed, X } from "lucide-react";
import type { EvaluationQuestion, SelectedEvaluationDetail } from "./types";

type Props = {
  selectedEvaluationDetail: SelectedEvaluationDetail | null;
  setSelectedEvaluationDetail: (detail: SelectedEvaluationDetail | null) => void;
};

const getInitials = (name?: string) => {
  if (!name) return "-";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const formatAnswer = (answer?: string) => {
  if (!answer) return "-";

  return answer
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(", ");
};

const getAnswerLabel = (question: EvaluationQuestion) => {
  switch (question.type) {
    case "RATING":
      return "Rating";
    case "CHECKBOX":
      return "Pilihan";
    case "RADIO":
      return "Jawaban";
    default:
      return "Catatan";
  }
};

export const EvaluationDetailPanel = ({
  selectedEvaluationDetail,
  setSelectedEvaluationDetail,
}: Props) => {
  if (!selectedEvaluationDetail) {
    return null;
  }

  const { evaluation, feedbackUser } = selectedEvaluationDetail;
  const isDone = Boolean(feedbackUser?.done);
  const answersByName = new Map(
    (feedbackUser?.feedbackAnswer ?? []).map((answer) => [answer.name, answer]),
  );
  const questions = (evaluation?.feedbackQuestion ?? [])
    .slice()
    .sort((current, next) => current.position - next.position);

  return (
    <div className="h-[calc(100vh-180px)] min-h-[520px] border-t bg-muted/30">
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 border-b bg-background p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {getInitials(selectedEvaluationDetail.name)}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold">
                    {selectedEvaluationDetail.name}
                  </h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {selectedEvaluationDetail.moduleTitle}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant={isDone ? "default" : "secondary"}
                  className="h-6 gap-1 px-2"
                >
                  {isDone ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <CircleDashed className="h-3 w-3" />
                  )}
                  {isDone ? "Sudah mengerjakan" : "Belum mengerjakan"}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  {questions.length} pertanyaan
                </span>
              </div>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={() => setSelectedEvaluationDetail(null)}
              aria-label="Tutup detail evaluasi"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {!evaluation ? (
            <div className="mx-auto flex max-w-sm flex-col items-center rounded-md border border-dashed bg-background p-5 text-center text-sm text-muted-foreground">
              <ClipboardCheck className="mb-2 h-5 w-5" />
              Data evaluasi pada module ini belum tersedia.
            </div>
          ) : !isDone ? (
            <div className="mx-auto flex max-w-sm flex-col items-center rounded-md border border-dashed bg-background p-5 text-center text-sm text-muted-foreground">
              <CircleDashed className="mb-2 h-5 w-5" />
              Peserta belum menyelesaikan evaluasi ini.
            </div>
          ) : questions.length ? (
            questions.map((question, index) => {
              const answer = answersByName.get(question.name);

              return (
                <div key={question.name} className="space-y-2">
                  <div className="flex items-end gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-[11px] font-semibold text-muted-foreground shadow-sm">
                      Q{index + 1}
                    </div>
                    <div className="max-w-[86%] rounded-2xl rounded-bl-sm bg-background px-4 py-3 shadow-sm">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                          {question.type}
                        </Badge>
                        {question.required ? (
                          <span className="text-[11px] text-muted-foreground">
                            Wajib
                          </span>
                        ) : null}
                      </div>
                      <p className="whitespace-pre-wrap text-sm">
                        {question.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end justify-end gap-2">
                    <div className="max-w-[86%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-primary-foreground shadow-sm">
                      <p className="mb-1 text-[11px] text-primary-foreground/75">
                        {getAnswerLabel(question)}
                      </p>
                      <p className="whitespace-pre-wrap text-sm">
                        {formatAnswer(answer?.answer)}
                      </p>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground shadow-sm">
                      {getInitials(selectedEvaluationDetail.name)}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="mx-auto flex max-w-sm flex-col items-center rounded-md border border-dashed bg-background p-5 text-center text-sm text-muted-foreground">
              <ClipboardCheck className="mb-2 h-5 w-5" />
              Pertanyaan evaluasi belum tersedia.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

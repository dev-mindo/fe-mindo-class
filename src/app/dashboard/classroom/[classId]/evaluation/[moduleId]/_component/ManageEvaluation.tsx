"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type EvaluationOption = {
  id: string;
  label: string;
};

type EvaluationQuestionType = "RADIO" | "CHECKBOX" | "TEXT" | "RATING";

type EvaluationQuestion = {
  evaluationId: number;
  name: string;
  position: number;
  title: string;
  required: boolean;
  value: EvaluationOption[] | "";
  type: EvaluationQuestionType;
};

type EvaluationDetail = {
  id: number;
  moduleId?: number;
  linkUrl: string | null;
  feedbackQuestion?: EvaluationQuestionResponse[];
};

type EvaluationQuestionResponse = {
  evaluationId: number;
  name: string;
  position: number;
  title: string;
  required: boolean;
  value: EvaluationOption[] | string | null;
  type: string;
};

const QUESTION_TYPES: EvaluationQuestionType[] = [
  "RADIO",
  "CHECKBOX",
  "TEXT",
  "RATING",
];

const parseOptions = (value: unknown): EvaluationOption[] => {
  if (Array.isArray(value)) {
    return value.map((option) => ({
      id: String(option?.id ?? ""),
      label: String(option?.label ?? ""),
    }));
  }

  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parseOptions(parsed) : [];
  } catch {
    return [];
  }
};

const normalizeQuestion = (
  question: EvaluationQuestionResponse,
  index: number,
  evaluationId: number
): EvaluationQuestion => {
  const type = QUESTION_TYPES.includes(question.type as EvaluationQuestionType)
    ? (question.type as EvaluationQuestionType)
    : "TEXT";

  return {
    evaluationId: Number(question.evaluationId ?? evaluationId),
    name: question.name || `pertanyaan_${index + 1}`,
    position: Number(question.position ?? index + 1),
    title: question.title || "",
    required: Boolean(question.required),
    type,
    value:
      type === "RADIO" || type === "CHECKBOX"
        ? parseOptions(question.value)
        : "",
  };
};

const getQuestionAnchorId = (index: number) => `evaluation-question-${index + 1}`;

export const ManageEvaluation = () => {
  const params = useParams<{ classId: string; moduleId: string }>();
  const [evaluationId, setEvaluationId] = useState(0);
  const [linkUrl, setLinkUrl] = useState("");
  const [deleteMissingQuestions, setDeleteMissingQuestions] = useState(false);
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchEvaluation = async () => {
    setIsLoading(true);

    const response: ApiResponse<EvaluationDetail> = await fetchApi(
      `/admin/evaluation/module/${params.moduleId}`
    );

    setIsLoading(false);

    if (response.statusCode !== 200 || !response.data) {
      toast.error(response.message || "Gagal mengambil data evaluasi");
      return;
    }

    setEvaluationId(response.data.id);
    setLinkUrl(response.data.linkUrl ?? "");
    setQuestions(
      (response.data.feedbackQuestion ?? [])
        .map((question, index) =>
          normalizeQuestion(question, index, response.data?.id ?? 0)
        )
        .sort((current, next) => current.position - next.position)
    );
  };

  useEffect(() => {
    fetchEvaluation();
  }, [params.moduleId]);

  const updateQuestion = (
    index: number,
    updater: (question: EvaluationQuestion) => EvaluationQuestion
  ) => {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? updater(question) : question
      )
    );
  };

  const addQuestion = () => {
    setQuestions((current) => [
      ...current,
      {
        evaluationId,
        name: `pertanyaan_${current.length + 1}`,
        position: current.length + 1,
        title: "",
        required: true,
        value: "",
        type: "TEXT",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((current) =>
      current
        .filter((_, questionIndex) => questionIndex !== index)
        .map((question, questionIndex) => ({
          ...question,
          position: questionIndex + 1,
        }))
    );
  };

  const addOption = (questionIndex: number) => {
    updateQuestion(questionIndex, (question) => {
      const options = Array.isArray(question.value) ? question.value : [];

      return {
        ...question,
        value: [
          ...options,
          {
            id: `option_${options.length + 1}`,
            label: "",
          },
        ],
      };
    });
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    field: keyof EvaluationOption,
    value: string
  ) => {
    updateQuestion(questionIndex, (question) => {
      const options = Array.isArray(question.value) ? question.value : [];

      return {
        ...question,
        value: options.map((option, currentOptionIndex) =>
          currentOptionIndex === optionIndex
            ? { ...option, [field]: value }
            : option
        ),
      };
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    updateQuestion(questionIndex, (question) => {
      const options = Array.isArray(question.value) ? question.value : [];

      return {
        ...question,
        value: options.filter((_, index) => index !== optionIndex),
      };
    });
  };

  const validateQuestions = () => {
    if (!questions.length) {
      toast.error("Minimal satu pertanyaan evaluasi wajib dibuat");
      return false;
    }

    const invalidQuestion = questions.find(
      (question) => !question.name.trim() || !question.title.trim()
    );

    if (invalidQuestion) {
      toast.error("Nama field dan pertanyaan wajib diisi");
      return false;
    }

    const invalidOptionQuestion = questions.find((question) => {
      if (question.type !== "RADIO" && question.type !== "CHECKBOX") {
        return false;
      }

      const options = Array.isArray(question.value) ? question.value : [];

      return (
        !options.length ||
        options.some((option) => !option.id.trim() || !option.label.trim())
      );
    });

    if (invalidOptionQuestion) {
      toast.error("Pertanyaan RADIO/CHECKBOX wajib memiliki opsi lengkap");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateQuestions()) return;

    if (!evaluationId) {
      toast.error("ID evaluasi tidak ditemukan");
      return;
    }

    setIsSaving(true);

    const response: ApiResponse = await fetchApi(`/admin/evaluation/${evaluationId}`, {
      method: "PUT",
      body: {
        linkUrl: linkUrl.trim() || null,
        deleteMissingQuestions,
        feedbackQuestions: questions
          .slice()
          .sort((current, next) => current.position - next.position)
          .map((question) => ({
            name: question.name,
            position: question.position,
            title: question.title,
            required: question.required,
            value:
              question.type === "RADIO" || question.type === "CHECKBOX"
                ? question.value
                : "",
            type: question.type,
          })),
      },
    });

    setIsSaving(false);

    if (response.statusCode !== 200 && response.statusCode !== 201) {
      toast.error(response.message || "Gagal menyimpan evaluasi");
      return;
    }

    toast.success(response.message || "Evaluasi berhasil disimpan");
    fetchEvaluation();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Evaluasi</h1>
          <p className="text-sm text-muted-foreground">
            Kelola link dan pertanyaan feedback evaluasi.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href={`/dashboard/classroom/${params.classId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <Button disabled={isSaving || isLoading} onClick={handleSave}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Simpan
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Evaluasi</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>ID Modul</Label>
            <Input disabled value={params.moduleId} />
          </div>
          <div className="grid gap-2">
            <Label>ID Evaluasi</Label>
            <Input disabled value={evaluationId || "-"} />
          </div>
          <div className="grid gap-2">
            <Label>Link Eksternal Evaluasi</Label>
            <Input
              placeholder="https://..."
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
            />
          </div>
          <label className="flex items-center justify-between gap-3 rounded-md border px-3 py-2.5">
            <span>
              <span className="block text-sm font-medium">
                Hapus pertanyaan yang tidak dikirim
              </span>
              <span className="block text-xs text-muted-foreground">
                Aktifkan jika pertanyaan yang dihapus dari form juga perlu
                dihapus dari server.
              </span>
            </span>
            <input
              checked={deleteMissingQuestions}
              className="h-4 w-4"
              type="checkbox"
              onChange={(event) =>
                setDeleteMissingQuestions(event.target.checked)
              }
            />
          </label>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Pertanyaan Evaluasi</p>
          <p className="text-sm text-muted-foreground">
            Total {questions.length} pertanyaan
          </p>
        </div>
        <Button type="button" variant="outline" onClick={addQuestion}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pertanyaan
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex h-40 items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Memuat evaluasi...
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && questions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <p className="text-sm font-medium">Belum ada pertanyaan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tambahkan pertanyaan RADIO, CHECKBOX, TEXT, atau RATING.
            </p>
            <Button className="mt-4" type="button" onClick={addQuestion}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pertanyaan
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && questions.length > 0 ? (
        <div className="grid min-h-[calc(100vh-220px)] gap-5 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="self-start lg:sticky lg:top-4">
            <CardHeader>
              <CardTitle className="text-base">Navigasi Pertanyaan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[calc(100vh-330px)] space-y-2 overflow-y-auto pr-1">
                {questions.map((question, questionIndex) => (
                  <a
                    key={`${question.name}-nav-${questionIndex}`}
                    className="flex min-w-0 items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    href={`#${getQuestionAnchorId(questionIndex)}`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                      {questionIndex + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {question.title.trim() ||
                          `Pertanyaan ${questionIndex + 1}`}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {question.type} - Posisi {question.position}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
            <div className="grid gap-4">
              {questions.map((question, questionIndex) => {
                const hasOptions =
                  question.type === "RADIO" || question.type === "CHECKBOX";
                const options = Array.isArray(question.value)
                  ? question.value
                  : [];

                return (
                  <Card
                    id={getQuestionAnchorId(questionIndex)}
                    key={`${question.name}-${questionIndex}`}
                    className="scroll-mt-4"
                  >
                    <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>Q{questionIndex + 1}</Badge>
                        <Badge variant="outline">{question.type}</Badge>
                        {question.required ? (
                          <Badge variant="secondary">Wajib</Badge>
                        ) : null}
                      </div>
                      <Button
                        aria-label={`Hapus pertanyaan ${questionIndex + 1}`}
                        size="icon"
                        type="button"
                        variant="ghost"
                        onClick={() => removeQuestion(questionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid gap-3 md:grid-cols-[120px_1fr]">
                        <div className="grid gap-2">
                          <Label>Posisi</Label>
                          <Input
                            min={1}
                            type="number"
                            value={question.position}
                            onChange={(event) =>
                              updateQuestion(
                                questionIndex,
                                (currentQuestion) => ({
                                  ...currentQuestion,
                                  position: Number(event.target.value) || 1,
                                })
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Nama Field</Label>
                          <Input
                            placeholder="alasanTidakMengikutiLiveClass10"
                            value={question.name}
                            onChange={(event) =>
                              updateQuestion(
                                questionIndex,
                                (currentQuestion) => ({
                                  ...currentQuestion,
                                  name: event.target.value,
                                })
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>Pertanyaan</Label>
                        <Textarea
                          className="min-h-24 resize-y"
                          placeholder="Tulis pertanyaan evaluasi"
                          value={question.title}
                          onChange={(event) =>
                            updateQuestion(
                              questionIndex,
                              (currentQuestion) => ({
                                ...currentQuestion,
                                title: event.target.value,
                              })
                            )
                          }
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label>Tipe Pertanyaan</Label>
                          <Select
                            value={question.type}
                            onValueChange={(value) => {
                              const nextType =
                                value as EvaluationQuestionType;

                              updateQuestion(
                                questionIndex,
                                (currentQuestion) => ({
                                  ...currentQuestion,
                                  type: nextType,
                                  value:
                                    nextType === "RADIO" ||
                                    nextType === "CHECKBOX"
                                      ? parseOptions(currentQuestion.value)
                                      : "",
                                })
                              );
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tipe" />
                            </SelectTrigger>
                            <SelectContent>
                              {QUESTION_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <label className="flex items-center justify-between gap-3 rounded-md border px-3 py-2.5">
                          <span>
                            <span className="block text-sm font-medium">
                              Wajib
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              Peserta harus mengisi pertanyaan ini.
                            </span>
                          </span>
                          <input
                            checked={question.required}
                            className="h-4 w-4"
                            type="checkbox"
                            onChange={(event) =>
                              updateQuestion(
                                questionIndex,
                                (currentQuestion) => ({
                                  ...currentQuestion,
                                  required: event.target.checked,
                                })
                              )
                            }
                          />
                        </label>
                      </div>

                      {hasOptions ? (
                        <div className="grid gap-3 rounded-md border p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium">
                                Pilihan Jawaban
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Isi id dan label untuk value pertanyaan.
                              </p>
                            </div>
                            <Button
                              size="sm"
                              type="button"
                              variant="outline"
                              onClick={() => addOption(questionIndex)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Tambah Opsi
                            </Button>
                          </div>

                          {options.length ? (
                            <div className="grid gap-2">
                              {options.map((option, optionIndex) => (
                                <div
                                  className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]"
                                  key={`${option.id}-${optionIndex}`}
                                >
                                  <Input
                                    placeholder="idOpsi"
                                    value={option.id}
                                    onChange={(event) =>
                                      updateOption(
                                        questionIndex,
                                        optionIndex,
                                        "id",
                                        event.target.value
                                      )
                                    }
                                  />
                                  <Input
                                    placeholder="Label opsi"
                                    value={option.label}
                                    onChange={(event) =>
                                      updateOption(
                                        questionIndex,
                                        optionIndex,
                                        "label",
                                        event.target.value
                                      )
                                    }
                                  />
                                  <Button
                                    aria-label={`Hapus opsi ${
                                      optionIndex + 1
                                    }`}
                                    size="icon"
                                    type="button"
                                    variant="ghost"
                                    onClick={() =>
                                      removeOption(questionIndex, optionIndex)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                              Belum ada opsi jawaban.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                          Tipe {question.type} memakai value kosong.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

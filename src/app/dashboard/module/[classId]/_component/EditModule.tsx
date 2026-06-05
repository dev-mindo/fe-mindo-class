"use client";
import { IInput } from "@/components/base/IInput";
import ISelect from "@/components/base/ISelect";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import moduleSchema, {
  ModuleFormValues,
  ModuleType,
} from "@/entities/schema/module.schema";
import quizSchema, { QuizFormSchema } from "@/entities/schema/quiz.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ModuleDataOption } from "./AddModuleDialog";
import { useEffect, useState } from "react";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import ISwitch from "@/components/base/ISwitch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { z } from "zod";

const assignmentSchema = z.object({
  editable: z.boolean(),
  canLate: z.boolean(),
  startAt: z.string().min(1, "Waktu mulai wajib diisi"),
  endAt: z.string().min(1, "Waktu selesai wajib diisi"),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

const liveSchema = z.object({
  link: z.string().min(1, "Link wajib diisi"),
  startAt: z.string().min(1, "Waktu mulai wajib diisi"),
  endAt: z.string().min(1, "Waktu selesai wajib diisi"),
});

type LiveFormValues = z.infer<typeof liveSchema>;

type Props = {
  moduleId: number;
  showEditModule: boolean;
  setShowEditModule: (isShowing: boolean) => void;
  getClassModule: () => void
};

export const EditModule = (props: Props) => {
  const [showEditModule, setShowEditModule] = useState<boolean>(
    props.showEditModule
  );
  const [sectionTitle, setSectionTitle] = useState<string>("");
  const [quizId, setQuizId] = useState<number | null>(null);
  const [assignmentId, setAssignmentId] = useState<number | null>(null);
  const [liveId, setLiveId] = useState<number | null>(null);
  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      sectionId: 0,
      title: "",
      type: ModuleType.INFO, // atau default dari enum
      menuTitle: "",
      step: 0,
      hide: false,
      isLocked: false,
    },
  });
  const quizForm = useForm<QuizFormSchema>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      minimunScore: 0,
      hour: 0,
      minute: 0,
      limitTrial: 0,
    },
  });
  const assignmentForm = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      editable: true,
      canLate: true,
      startAt: "",
      endAt: "",
    },
  });
  const liveForm = useForm<LiveFormValues>({
    resolver: zodResolver(liveSchema),
    defaultValues: {
      link: "",
      startAt: "",
      endAt: "",
    },
  });
  const selectedModuleType = form.watch("type");
  const showQuizForm = selectedModuleType === ModuleType.QUIZ;
  const showAssignmentForm = selectedModuleType === ModuleType.TASK;
  const showLiveForm = selectedModuleType === ModuleType.LIVE;
  const isSuccessResponse = (response?: ApiResponse) =>
    response?.statusCode === 200 || response?.statusCode === 201;

  const formatDateTimeLocal = (value?: string | Date | null) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const updateAssignment = async (value: AssignmentFormValues) => {
    const payload = {
      ...value,
      startAt: new Date(value.startAt).toISOString(),
      endAt: new Date(value.endAt).toISOString(),
      moduleId: props.moduleId,
    };

    const endpoint = assignmentId
      ? `/admin/assignment/${assignmentId}`
      : "/admin/assignment";
    const method = assignmentId ? "PUT" : "POST";
    let response: ApiResponse = await fetchApi(endpoint, {
      method,
      body: payload,
    });

    if (response?.statusCode === 404 && assignmentId) {
      response = await fetchApi(`/assignment/${assignmentId}`, {
        method: "PUT",
        body: payload,
      });
    }

    return response;
  };

  const updateLive = async (value: LiveFormValues) => {
    const payload = {
      ...value,
      startAt: new Date(value.startAt).toISOString(),
      endAt: new Date(value.endAt).toISOString(),
      moduleId: props.moduleId,
    };

    const endpoint = liveId
      ? `/admin/video-live/${liveId}`
      : "/admin/video-live";
    const method = liveId ? "PUT" : "POST";
    let response: ApiResponse = await fetchApi(endpoint, {
      method,
      body: payload,
    });

    if (response?.statusCode === 404) {
      response = await fetchApi(liveId ? `/admin/live/${liveId}` : "/admin/live", {
        method,
        body: payload,
      });
    }

    return response;
  };

  const handleUpdateModule = async (value: any) => {
    if (showQuizForm) {
      const isValidQuizForm = await quizForm.trigger();

      if (!isValidQuizForm) {
        return;
      }

      if (!quizId) {
        toast.error("Data quiz pada modul ini tidak ditemukan");
        return;
      }
    }

    if (showAssignmentForm) {
      const isValidAssignmentForm = await assignmentForm.trigger();

      if (!isValidAssignmentForm) {
        return;
      }
    }

    if (showLiveForm) {
      const isValidLiveForm = await liveForm.trigger();

      if (!isValidLiveForm) {
        return;
      }
    }

    const updateDataModule: ApiResponse = await fetchApi(
      `/admin/module/${props.moduleId}`,
      {
        method: "PUT",
        body: value,
      }
    );

    if (updateDataModule) {
      if (updateDataModule.statusCode === 200) {
        if (showQuizForm) {
          const quizValue = quizForm.getValues();
          const updateQuiz: ApiResponse = await fetchApi(
            `/admin/quiz/update-quiz/${quizId}`,
            {
              method: "PUT",
              body: quizValue,
            }
          );

          if (!updateQuiz || updateQuiz.statusCode !== 200) {
            toast.error(updateQuiz?.message || "Quiz gagal diperbaharui");
            return;
          }
        }

        if (showAssignmentForm) {
          const updateTaskAssignment = await updateAssignment(
            assignmentForm.getValues()
          );

          if (!isSuccessResponse(updateTaskAssignment)) {
            toast.error(
              updateTaskAssignment?.message || "Assignment gagal diperbaharui"
            );
            return;
          }
        }

        if (showLiveForm) {
          const updateLiveData = await updateLive(liveForm.getValues());

          if (!isSuccessResponse(updateLiveData)) {
            toast.error(updateLiveData?.message || "Live gagal diperbaharui");
            return;
          }
        }

        toast.info(`Data modul sudah diperbaharui`);
        props.getClassModule()
        setShowEditModule(false)
      } else {
        toast.error(updateDataModule.message);
      }
    } else {
      toast.error("Data gagal diperbaharui, kesalahan tidak diketahui");
    }
  };

  const handleEditModule = async () => {
    const fetchDataModule: ApiResponse<TDetailModule> = await fetchApi(
      `/admin/module/show-detail-by-module-id/${props.moduleId}`
    );
    if (fetchDataModule) {
      if (fetchDataModule.statusCode === 200) {
        const dataModule = fetchDataModule.data;
        if (dataModule) {
          setSectionTitle(dataModule.section.title);
          form.setValue("hide", dataModule.hide);
          form.setValue("isLocked", dataModule.isLocked);
          form.setValue("menuTitle", dataModule.menuTitle);
          form.setValue("sectionId", dataModule.section.id);
          form.setValue("step", dataModule.step);
          form.setValue("title", dataModule.title);
          form.setValue("type", dataModule.type as ModuleType);

          if (dataModule.dataQuiz) {
            const [hour = "0", minute = "0"] =
              dataModule.dataQuiz.limitTime.split(":");

            setQuizId(dataModule.dataQuiz.id);
            quizForm.setValue("title", dataModule.dataQuiz.title || "");
            quizForm.setValue("minimunScore", dataModule.dataQuiz.minimumScore);
            quizForm.setValue("hour", Number(hour));
            quizForm.setValue("minute", Number(minute));
            quizForm.setValue("limitTrial", dataModule.dataQuiz.limitTrial);
          } else {
            setQuizId(null);
            quizForm.reset({
              title: "",
              minimunScore: 0,
              hour: 0,
              minute: 0,
              limitTrial: 0,
            });
          }

          const assignmentData =
            dataModule.assignment ||
            dataModule.dataAssignment ||
            dataModule.task?.at(0) ||
            null;

          if (assignmentData) {
            setAssignmentId(assignmentData.id);
            assignmentForm.reset({
              editable: assignmentData.editable ?? true,
              canLate: assignmentData.canLate ?? true,
              startAt: formatDateTimeLocal(assignmentData.startAt),
              endAt: formatDateTimeLocal(assignmentData.endAt),
            });
          } else {
            setAssignmentId(null);
            assignmentForm.reset({
              editable: true,
              canLate: true,
              startAt: "",
              endAt: "",
            });
          }

          const liveData =
            dataModule.videoLive ||
            dataModule.dataLive ||
            dataModule.live ||
            null;

          if (liveData) {
            setLiveId(liveData.id);
            liveForm.reset({
              link: liveData.link ?? "",
              startAt: formatDateTimeLocal(liveData.startAt),
              endAt: formatDateTimeLocal(liveData.endAt),
            });
          } else {
            setLiveId(null);
            liveForm.reset({
              link: "",
              startAt: "",
              endAt: "",
            });
          }
        }
      }else{
        toast.error(fetchDataModule.message || 'Gagal menampilkan data')
      }
    }
  };

  useEffect(() => {
    handleEditModule();
  }, [props.moduleId]);

  useEffect(() => {
    props.setShowEditModule(showEditModule);
  }, [showEditModule]);

  return (
    <>
      <div className="flex max-h-[calc(100vh-180px)] flex-col">
        <h1 className="shrink-0">Edit Detail Modul</h1>
        <div className="mt-4 min-h-0 overflow-y-auto pr-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateModule)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Section</Label>
                  <IInput
                    control={form.control}
                    name="sectionId"
                    type="hidden"
                  ></IInput>
                  <Input defaultValue={sectionTitle || ""} disabled={true} />
                </div>
                <div className="grid gap-2">
                  <Label>Judul</Label>
                  <IInput control={form.control} name="title"></IInput>
                </div>
                <div className="grid gap-2">
                  <Label>Tipe Modul</Label>
                  <ISelect
                    control={form.control}
                    name="type"
                    options={ModuleDataOption}
                  ></ISelect>
                </div>
                <div className="grid gap-2">
                  <Label>Judul Menu</Label>
                  <IInput control={form.control} name="menuTitle"></IInput>
                </div>
                <div className="grid gap-2">
                  <Label>Step</Label>
                  <IInput
                    disabled={true}
                    type="number"
                    control={form.control}
                    name="step"
                  ></IInput>
                </div>
                <div className="grid gap-2">
                  <Label>Sembunyikan</Label>
                  <ISwitch control={form.control} name="hide"></ISwitch>
                </div>
                <div className="grid gap-2">
                  <Label>Terkunci</Label>
                  <ISwitch control={form.control} name="isLocked"></ISwitch>
                </div>
                {showQuizForm ? (
                  <div className="grid gap-4 border-t pt-4">
                    <div>
                      <h2 className="text-sm font-semibold">
                        Konfigurasi Quiz
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Atur detail quiz yang terhubung dengan modul ini.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label>Judul Kuis</Label>
                      <IInput
                        control={quizForm.control}
                        name="title"
                        placeholder="Judul kuis"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Skor Minimal</Label>
                      <IInput
                        control={quizForm.control}
                        name="minimunScore"
                        type="number"
                        placeholder="70"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Batas Waktu</Label>
                      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
                        <IInput
                          control={quizForm.control}
                          name="hour"
                          type="number"
                          placeholder="Jam"
                        />
                        <span className="pt-2 text-sm text-muted-foreground">
                          :
                        </span>
                        <IInput
                          control={quizForm.control}
                          name="minute"
                          type="number"
                          placeholder="Menit"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Percobaan</Label>
                      <IInput
                        control={quizForm.control}
                        name="limitTrial"
                        type="number"
                        placeholder="3"
                      />
                    </div>
                  </div>
                ) : null}
                {showAssignmentForm ? (
                  <Form {...assignmentForm}>
                    <div className="grid gap-4 border-t pt-4">
                      <div>
                        <h2 className="text-sm font-semibold">
                          Konfigurasi Assignment
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Atur aturan pengumpulan tugas untuk modul ini.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label>Dapat Diedit</Label>
                        <ISwitch
                          control={assignmentForm.control}
                          name="editable"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Boleh Terlambat</Label>
                        <ISwitch
                          control={assignmentForm.control}
                          name="canLate"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Mulai</Label>
                        <IInput
                          control={assignmentForm.control}
                          name="startAt"
                          type="datetime-local"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Selesai</Label>
                        <IInput
                          control={assignmentForm.control}
                          name="endAt"
                          type="datetime-local"
                        />
                      </div>
                    </div>
                  </Form>
                ) : null}
                {showLiveForm ? (
                  <Form {...liveForm}>
                    <div className="grid gap-4 border-t pt-4">
                      <div>
                        <h2 className="text-sm font-semibold">
                          Konfigurasi Live
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Atur link dan jadwal live untuk modul ini.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label>Link</Label>
                        <IInput
                          control={liveForm.control}
                          name="link"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Mulai</Label>
                        <IInput
                          control={liveForm.control}
                          name="startAt"
                          type="datetime-local"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Selesai</Label>
                        <IInput
                          control={liveForm.control}
                          name="endAt"
                          type="datetime-local"
                        />
                      </div>
                    </div>
                  </Form>
                ) : null}
              </div>
              <div className="sticky bottom-0 mt-4 flex justify-end gap-2 border-t bg-card py-3">
                <Button
                  type="button"
                  onClick={() => {
                    setShowEditModule(false);
                  }}
                  variant={"secondary"}
                >
                  Cancel
                </Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
};

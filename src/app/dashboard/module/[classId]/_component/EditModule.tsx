"use client";
import { IInput } from "@/components/base/IInput";
import ISelect from "@/components/base/ISelect";
import QuillEditor from "@/components/base/EditorQuill";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import moduleSchema, {
  ModuleFormValues,
  ModuleType,
} from "@/entities/schema/module.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ModuleDataOption } from "./AddModuleDialog";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import ISwitch from "@/components/base/ISwitch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Film,
  FileText,
  ImageOff,
  Loader2,
  Pencil,
  Play,
  Search,
  Video,
  X,
} from "lucide-react";

type VideoItem = {
  guid: string;
  title: string;
  videoLibraryId?: number;
  thumbnail?: string;
  thumbnailUrl?: string;
  thumbnailFileName?: string;
  previewUrl?: string;
  videoUrl?: string;
  embedUrl?: string;
};

type VideoListResponse = {
  items?: VideoItem[];
  totalItems?: number;
};

const VIDEO_ITEMS_PER_PAGE = 2;
const DESCRIPTION_EDITOR_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link"],
    ["clean"],
  ],
};
const DESCRIPTION_EDITOR_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "blockquote",
  "link",
];

const assignmentSchema = z
  .object({
    editable: z.boolean(),
    canLate: z.boolean(),
    startAt: z.string().min(1, "Waktu mulai wajib diisi"),
    endAt: z.string().min(1, "Waktu selesai wajib diisi"),
  })
  .superRefine((data, ctx) => {
    const startAt = new Date(data.startAt);
    const endAt = new Date(data.endAt);

    if (endAt <= startAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date harus lebih besar dari start date",
        path: ["endAt"],
      });
    }
  });

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

const updateQuizFormSchema = z.object({
  title: z.string().trim().min(1, "Title quiz wajib diisi"),
  minimunScore: z.coerce
    .number()
    .min(0, "Minimum score tidak boleh negatif"),
  hour: z.coerce.number().int().min(0, "Jam tidak boleh negatif"),
  minute: z.coerce.number().int().min(0).max(59, "Menit maksimal 59"),
  limitTrial: z.coerce.number().int().min(0, "Limit tidak boleh negatif"),
  pagination: z.boolean(),
  random: z.boolean(),
  publish: z.boolean(),
});

type UpdateQuizFormValues = z.infer<typeof updateQuizFormSchema>;

const liveSchema = z
  .object({
    videoId: z.string().trim().min(1, "Video ID wajib diisi"),
    link: z.string().trim().min(1, "Link live wajib diisi"),
    startAt: z.string().min(1, "Waktu mulai wajib diisi"),
    endAt: z.string().min(1, "Waktu selesai wajib diisi"),
  })
  .superRefine((data, ctx) => {
    const startAt = new Date(data.startAt);
    const endAt = new Date(data.endAt);

    if (endAt <= startAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date harus lebih besar dari start date",
        path: ["endAt"],
      });
    }
  });

type LiveFormValues = z.infer<typeof liveSchema>;

type Props = {
  classId: string;
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
  const [videoId, setVideoId] = useState<string>("");
  const [videoName, setVideoName] = useState<string>("");
  const [showVideoDialog, setShowVideoDialog] = useState<boolean>(false);
  const [videoList, setVideoList] = useState<VideoItem[]>([]);
  const [videoPage, setVideoPage] = useState<number>(1);
  const [videoTotalItems, setVideoTotalItems] = useState<number>(0);
  const [isLoadingVideo, setIsLoadingVideo] = useState<boolean>(false);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  const [videoSearch, setVideoSearch] = useState<string>("");
  const [debouncedVideoSearch, setDebouncedVideoSearch] =
    useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [descriptionDraft, setDescriptionDraft] = useState<string>("");
  const [showDescriptionDialog, setShowDescriptionDialog] =
    useState<boolean>(false);
  const [descriptionEditorKey, setDescriptionEditorKey] = useState<number>(0);
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
  const quizForm = useForm<UpdateQuizFormValues>({
    resolver: zodResolver(updateQuizFormSchema),
    defaultValues: {
      title: "",
      minimunScore: 0,
      hour: 0,
      minute: 0,
      limitTrial: 0,
      pagination: false,
      random: false,
      publish: false,
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
      videoId: "",
      link: "",
      startAt: "",
      endAt: "",
    },
  });
  const selectedModuleType = form.watch("type");
  const showQuizForm = selectedModuleType === ModuleType.QUIZ;
  const showAssignmentForm = selectedModuleType === ModuleType.TASK;
  const showLiveForm = selectedModuleType === ModuleType.LIVE;
  const showVideoForm = selectedModuleType === ModuleType.VIDEO;
  const showVideoPicker = showVideoForm || showLiveForm;
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

  const handleUpdateModule = async (value: any) => {
    if (showQuizForm) {
      const isValidQuizForm = await quizForm.trigger();

      if (!isValidQuizForm) {
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

    if (showVideoForm && !videoId) {
      toast.error("Pilih video terlebih dahulu");
      return;
    }

    const quizValue = showQuizForm ? quizForm.getValues() : null;
    const assignmentValue = showAssignmentForm
      ? assignmentForm.getValues()
      : null;
    const liveValue = showLiveForm ? liveForm.getValues() : null;

    console.log('video id', videoId)

    const updateDataModule: ApiResponse = await fetchApi(
      `/admin/module/${props.moduleId}`,
      {
        method: "PUT",
        body: {
          ...value,
          description,
          ...(showVideoForm && videoId ? { videoId } : {}),
          ...(assignmentValue
            ? {
                task: {
                  ...assignmentValue,
                  startAt: new Date(assignmentValue.startAt).toISOString(),
                  endAt: new Date(assignmentValue.endAt).toISOString(),
                },
              }
            : {}),
          ...(quizValue
            ? {
                quiz: {
                  title: quizValue.title,
                  minimumScore: quizValue.minimunScore,
                  hour: quizValue.hour,
                  minute: quizValue.minute,
                  limitTrial: quizValue.limitTrial,
                  pagination: quizValue.pagination,
                  random: quizValue.random,
                  publish: quizValue.publish,
                },
              }
            : {}),
          ...(liveValue
            ? {
                live: {
                  videoId: liveValue.videoId,
                  link: liveValue.link,
                  startAt: new Date(liveValue.startAt).toISOString(),
                  endAt: new Date(liveValue.endAt).toISOString(),
                },
              }
            : {}),
        },
      }
    );

    if (updateDataModule) {
      if (isSuccessResponse(updateDataModule)) {
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
          form.setValue("hide", dataModule.hide ?? false);
          form.setValue("isLocked", dataModule.isLocked ?? false);
          form.setValue("menuTitle", dataModule.menuTitle);
          form.setValue("sectionId", dataModule.section.id);
          form.setValue("step", dataModule.step);
          form.setValue("title", dataModule.title);
          form.setValue("type", dataModule.type as ModuleType);
          setDescription(dataModule.description || "");
          setDescriptionDraft(dataModule.description || "");

          const legacyModuleData = dataModule as TDetailModule & {
            videoId?: string;
            videoName?: string;
            dataVideo?: {
              guid?: string;
              id?: string;
              title?: string;
              name?: string;
            } | null;
            video?: {
              guid?: string;
              id?: string;
              title?: string;
              name?: string;
            } | null;
            videoLive?: {
              video?: {
                guid?: string;
                id?: string;
                title?: string;
                name?: string;
              } | null;
            } | null;
            dataLive?: {
              video?: {
                guid?: string;
                id?: string;
                title?: string;
                name?: string;
              } | null;
            } | null;
            live?: {
              video?: {
                guid?: string;
                id?: string;
                title?: string;
                name?: string;
              } | null;
            } | null;
          };

          const selectedVideo = (
            dataModule.videoData?.video ||
            dataModule.liveData?.video ||
            legacyModuleData.dataVideo ||
            legacyModuleData.video ||
            legacyModuleData.videoLive?.video ||
            legacyModuleData.dataLive?.video ||
            legacyModuleData.live?.video
          ) as
            | {
                guid?: string;
                id?: string;
                title?: string;
                name?: string;
              }
            | null
            | undefined;

          setVideoId(
            dataModule.videoData?.videoId ||
              dataModule.liveData?.videoId ||
              legacyModuleData.videoId ||
              selectedVideo?.guid ||
              selectedVideo?.id ||
              ""
          );
          setVideoName(
            selectedVideo?.name ||
              legacyModuleData.videoName ||
              selectedVideo?.title ||
              ""
          );

          if (dataModule.dataQuiz) {
            const [hour = "0", minute = "0"] =
              dataModule.dataQuiz.limitTime.split(":");
            const quizData = dataModule.dataQuiz as typeof dataModule.dataQuiz & {
              pagination?: boolean;
              random?: boolean;
              publish?: boolean;
            };

            setQuizId(dataModule.dataQuiz.id);
            quizForm.setValue("title", dataModule.dataQuiz.title || "");
            quizForm.setValue("minimunScore", dataModule.dataQuiz.minimumScore);
            quizForm.setValue("hour", Number(hour));
            quizForm.setValue("minute", Number(minute));
            quizForm.setValue("limitTrial", dataModule.dataQuiz.limitTrial);
            quizForm.setValue("pagination", quizData.pagination ?? false);
            quizForm.setValue("random", quizData.random ?? false);
            quizForm.setValue("publish", quizData.publish ?? false);
          } else {
            setQuizId(null);
            quizForm.reset({
              title: "",
              minimunScore: 0,
              hour: 0,
              minute: 0,
              limitTrial: 0,
              pagination: false,
              random: false,
              publish: false,
            });
          }

          const assignmentData =
            dataModule.dataTask ||
            dataModule.assignment ||
            dataModule.dataAssignment ||
            dataModule.task?.at(0) ||
            null;

          if (assignmentData) {
            assignmentForm.reset({
              editable: assignmentData.editable ?? true,
              canLate: assignmentData.canLate ?? true,
              startAt: formatDateTimeLocal(assignmentData.startAt),
              endAt: formatDateTimeLocal(assignmentData.endAt),
            });
          } else {
            assignmentForm.reset({
              editable: true,
              canLate: true,
              startAt: "",
              endAt: "",
            });
          }

          const liveData =
            dataModule.liveData ||
            dataModule.videoLive ||
            dataModule.dataLive ||
            dataModule.live ||
            null;

          if (liveData) {
            liveForm.reset({
              videoId:
                dataModule.liveData?.videoId ||
                dataModule.videoData?.videoId ||
                legacyModuleData.videoId ||
                selectedVideo?.guid ||
                selectedVideo?.id ||
                "",
              link: liveData.link ?? "",
              startAt: formatDateTimeLocal(liveData.startAt),
              endAt: formatDateTimeLocal(liveData.endAt),
            });
          } else {
            liveForm.reset({
              videoId:
                dataModule.videoData?.videoId ||
                legacyModuleData.videoId ||
                selectedVideo?.guid ||
                selectedVideo?.id ||
                "",
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

  const fetchVideoList = async () => {
    setIsLoadingVideo(true);

    try {
      const response: ApiResponse<VideoListResponse> = await fetchApi(
        `/admin/video?page=${videoPage}&limit=${VIDEO_ITEMS_PER_PAGE}&search=${encodeURIComponent(debouncedVideoSearch)}`
      );

      if (response?.statusCode === 200) {
        setVideoList(response.data?.items || []);
        setVideoTotalItems(response.data?.totalItems || 0);
      } else {
        setVideoList([]);
        setVideoTotalItems(0);
        toast.error(response?.message || "Gagal mengambil daftar video");
      }
    } finally {
      setIsLoadingVideo(false);
    }
  };

  useEffect(() => {
    handleEditModule();
  }, [props.moduleId]);

  useEffect(() => {
    props.setShowEditModule(showEditModule);
  }, [showEditModule]);

  useEffect(() => {
    if (showLiveForm) {
      liveForm.setValue("videoId", videoId, {
        shouldValidate: Boolean(videoId),
      });
    }
  }, [videoId, showLiveForm]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedVideoSearch(videoSearch.trim());
    }, 500);

    return () => clearTimeout(timeout);
  }, [videoSearch]);

  useEffect(() => {
    if (showVideoDialog) {
      fetchVideoList();
    }
  }, [showVideoDialog, videoPage, debouncedVideoSearch]);

  const videoTotalPage = Math.max(
    Math.ceil(videoTotalItems / VIDEO_ITEMS_PER_PAGE),
    1
  );
  const videoPaginationPages = Array.from(
    { length: videoTotalPage },
    (_, index) => index + 1
  ).filter(
    (page) =>
      page === 1 ||
      page === videoTotalPage ||
      Math.abs(page - videoPage) <= 1
  );
  const getVideoThumbnail = (video: VideoItem) => {
    const thumbnail =
      video.thumbnailUrl || video.thumbnail || video.thumbnailFileName;

    return thumbnail?.startsWith("http") ? thumbnail : "";
  };
  const getVideoPreviewUrl = (video: VideoItem) => {
    if (video.embedUrl || video.videoUrl || video.previewUrl) {
      return video.embedUrl || video.videoUrl || video.previewUrl || "";
    }

    if (video.videoLibraryId) {
      return `https://iframe.mediadelivery.net/embed/${video.videoLibraryId}/${video.guid}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
    }

    return "";
  };
  const descriptionText = description
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const openDescriptionDialog = () => {
    setDescriptionDraft(description);
    setDescriptionEditorKey((key) => key + 1);
    setShowDescriptionDialog(true);
  };

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
                    disabled
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
                <div className="grid gap-4 rounded-lg border bg-muted/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-md bg-primary/10 p-2 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold">
                          Deskripsi Modul
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Tambahkan materi atau informasi pendukung modul.
                        </p>
                      </div>
                    </div>
                    <Button
                      className="shrink-0"
                      onClick={openDescriptionDialog}
                      size="sm"
                      type="button"
                      variant={descriptionText ? "outline" : "default"}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {descriptionText ? "Edit Deskripsi" : "Tambah Deskripsi"}
                    </Button>
                  </div>
                  {descriptionText ? (
                    <div className="rounded-md border bg-background p-3">
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {descriptionText}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed bg-background p-4 text-center">
                      <p className="text-sm font-medium">
                        Deskripsi belum ditambahkan
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Gunakan rich text editor untuk menulis deskripsi modul.
                      </p>
                    </div>
                  )}
                </div>
                {showQuizForm ? (
                  <div className="grid gap-4 border-t pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-sm font-semibold">
                          Konfigurasi Quiz
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Atur detail quiz yang terhubung dengan modul ini.
                        </p>
                      </div>
                      {quizId ? (
                        <Button asChild size="sm" type="button" variant="outline">
                          <Link
                            href={`/dashboard/classroom/${props.classId}/quiz/${quizId}`}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Quiz
                          </Link>
                        </Button>
                      ) : (
                        <Button disabled size="sm" type="button" variant="outline">
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Quiz
                        </Button>
                      )}
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
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                        <Label>Pagination</Label>
                        <ISwitch
                          control={quizForm.control}
                          name="pagination"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                        <Label>Acak Soal</Label>
                        <ISwitch control={quizForm.control} name="random" />
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                        <Label>Publish</Label>
                        <ISwitch control={quizForm.control} name="publish" />
                      </div>
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
                        <Label>Video ID</Label>
                        <IInput
                          control={liveForm.control}
                          name="videoId"
                          placeholder="Pilih video melalui tombol Lihat Video"
                          readOnly
                        />
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
                {showVideoPicker ? (
                  <div className="grid gap-4 rounded-lg border bg-muted/20 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-md bg-primary/10 p-2 text-primary">
                          <Video className="h-4 w-4" />
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold">
                            {showLiveForm
                              ? "Video Learning Live"
                              : "Detail Video"}
                          </h2>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {showLiveForm
                              ? "Pilih rekaman video yang dapat ditonton bersama detail live."
                              : "Video yang ditampilkan pada modul ini."}
                          </p>
                        </div>
                      </div>
                      <Button
                        className="shrink-0"
                        onClick={() => {
                          setVideoPage(1);
                          setShowVideoDialog(true);
                        }}
                        size="sm"
                        type="button"
                        variant={videoId ? "outline" : "default"}
                      >
                        <Film className="mr-2 h-4 w-4" />
                        {videoId ? "Ganti Video" : "Lihat Video"}
                      </Button>
                    </div>
                    {videoId ? (
                      <div className="rounded-md border bg-background p-3">
                        <div className="flex items-center gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {videoName}
                            </p>
                            <p className="mt-1 break-all text-xs text-muted-foreground">
                              ID: {videoId}
                            </p>
                          </div>
                          <Badge variant="secondary">Dipilih</Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed bg-background p-4 text-center">
                        <p className="text-sm font-medium">
                          Belum ada video dipilih
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Klik Lihat Video untuk memilih video learning
                          {showLiveForm ? " untuk modul live." : "."}
                        </p>
                      </div>
                    )}
                  </div>
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
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="flex max-h-[85vh] w-[calc(100%-2rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-5 pr-12">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Film className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Pilih Video Learning</DialogTitle>
                <DialogDescription className="mt-1">
                  Pilih satu video untuk digunakan pada modul.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="border-b bg-background px-6 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9 pr-10"
                onChange={(event) => {
                  setVideoSearch(event.target.value);
                  setVideoPage(1);
                }}
                placeholder="Cari berdasarkan nama video..."
                value={videoSearch}
              />
              {videoSearch ? (
                <button
                  aria-label="Hapus pencarian"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => {
                    setVideoSearch("");
                    setVideoPage(1);
                  }}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 p-6">
            {isLoadingVideo ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-background text-muted-foreground">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Memuat daftar video
                  </p>
                  <p className="mt-1 text-xs">Mohon tunggu sebentar.</p>
                </div>
              </div>
            ) : null}
            {!isLoadingVideo && videoList.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-background text-center">
                <div className="rounded-full bg-muted p-3">
                  <Video className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {debouncedVideoSearch
                      ? "Video tidak ditemukan"
                      : "Belum ada video"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {debouncedVideoSearch
                      ? `Tidak ada hasil untuk "${debouncedVideoSearch}".`
                      : "Daftar video learning masih kosong."}
                  </p>
                </div>
              </div>
            ) : null}
            {!isLoadingVideo && videoList.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {videoList.map((video) => {
                  const isSelected = video.guid === videoId;
                  const thumbnailUrl = getVideoThumbnail(video);
                  const previewUrl = getVideoPreviewUrl(video);

                  return (
                    <div
                      className={`group relative overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md ${
                        isSelected ? "border-primary ring-1 ring-primary" : ""
                      }`}
                      key={video.guid}
                    >
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        {thumbnailUrl ? (
                          <img
                            alt={`Thumbnail ${video.title}`}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            src={thumbnailUrl}
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                            <ImageOff className="h-7 w-7" />
                            <span className="text-xs">
                              Thumbnail tidak tersedia
                            </span>
                          </div>
                        )}
                        {previewUrl ? (
                          <button
                            aria-label={`Preview ${video.title}`}
                            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
                            onClick={() => setPreviewVideo(video)}
                            type="button"
                          >
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background/90 text-primary shadow-lg">
                              <Play className="ml-0.5 h-5 w-5 fill-current" />
                            </span>
                          </button>
                        ) : null}
                        {isSelected ? (
                          <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                            <Check className="h-4 w-4" />
                          </span>
                        ) : null}
                      </div>
                      <div className="p-4">
                        <p className="line-clamp-2 min-h-10 font-medium leading-snug">
                          {video.title}
                        </p>
                        <p className="mt-2 break-all text-xs text-muted-foreground">
                          {video.guid}
                        </p>
                        <div className="mt-4 flex gap-2">
                          <Button
                            className="flex-1"
                            disabled={!previewUrl}
                            onClick={() => setPreviewVideo(video)}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <Play className="mr-2 h-3.5 w-3.5" />
                            Preview
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => {
                              setVideoId(video.guid);
                              setVideoName(video.title);
                              setShowVideoDialog(false);
                            }}
                            size="sm"
                            type="button"
                            variant={isSelected ? "secondary" : "default"}
                          >
                            {isSelected ? "Terpilih" : "Pilih Video"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-4 border-t bg-background px-6 py-4">
            <div>
              <p className="text-sm font-medium">
                Halaman {videoPage} dari {videoTotalPage}
              </p>
              <p className="text-xs text-muted-foreground">
                {videoTotalItems} video tersedia
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                disabled={videoPage === 1 || isLoadingVideo}
                onClick={() =>
                  setVideoPage((page) => Math.max(page - 1, 1))
                }
                size="icon"
                type="button"
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Halaman sebelumnya</span>
              </Button>
              {videoPaginationPages.map((page, index) => {
                const previousPage = videoPaginationPages[index - 1];
                const showSeparator =
                  previousPage && page - previousPage > 1;

                return (
                  <div className="flex items-center gap-1" key={page}>
                    {showSeparator ? (
                      <span className="px-1 text-sm text-muted-foreground">
                        ...
                      </span>
                    ) : null}
                    <Button
                      disabled={isLoadingVideo}
                      onClick={() => setVideoPage(page)}
                      size="icon"
                      type="button"
                      variant={videoPage === page ? "default" : "outline"}
                    >
                      {page}
                    </Button>
                  </div>
                );
              })}
              <Button
                disabled={videoPage === videoTotalPage || isLoadingVideo}
                onClick={() =>
                  setVideoPage((page) =>
                    Math.min(page + 1, videoTotalPage)
                  )
                }
                size="icon"
                type="button"
                variant="outline"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Halaman berikutnya</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showDescriptionDialog}
        onOpenChange={(open) => {
          setShowDescriptionDialog(open);

          if (!open) {
            setDescriptionDraft(description);
          }
        }}
      >
        <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-5 pr-12">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Deskripsi Modul</DialogTitle>
                <DialogDescription className="mt-1">
                  Tulis deskripsi yang akan ditampilkan pada detail modul.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 p-6">
            <div className="rounded-lg border bg-background p-1 [&_.ql-container]:min-h-[320px] [&_.ql-editor]:min-h-[320px]">
              <QuillEditor
                className="min-h-[360px]"
                formats={DESCRIPTION_EDITOR_FORMATS}
                getEditorContent={descriptionDraft}
                key={descriptionEditorKey}
                modules={DESCRIPTION_EDITOR_MODULES}
                placeholder="Tulis deskripsi modul..."
                setEditorContent={setDescriptionDraft}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t bg-background px-6 py-4">
            <Button
              onClick={() => {
                setDescriptionDraft(description);
                setShowDescriptionDialog(false);
              }}
              type="button"
              variant="outline"
            >
              Batal
            </Button>
            <Button
              onClick={() => {
                setDescription(descriptionDraft);
                setShowDescriptionDialog(false);
              }}
              type="button"
            >
              Simpan Deskripsi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={previewVideo !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewVideo(null);
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-4xl overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-5 pr-12">
            <DialogTitle>{previewVideo?.title || "Preview Video"}</DialogTitle>
            <DialogDescription className="break-all">
              {previewVideo?.guid}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-black">
            {previewVideo && getVideoPreviewUrl(previewVideo) ? (
              <div className="relative aspect-video w-full">
                <iframe
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  src={getVideoPreviewUrl(previewVideo)}
                  title={`Preview ${previewVideo.title}`}
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center text-sm text-white/70">
                Preview video tidak tersedia
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 border-t px-6 py-4">
            <Button
              onClick={() => setPreviewVideo(null)}
              type="button"
              variant="outline"
            >
              Tutup
            </Button>
            {previewVideo ? (
              <Button
                onClick={() => {
                  setVideoId(previewVideo.guid);
                  setVideoName(previewVideo.title);
                  setPreviewVideo(null);
                  setShowVideoDialog(false);
                }}
                type="button"
              >
                Pilih Video
              </Button>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

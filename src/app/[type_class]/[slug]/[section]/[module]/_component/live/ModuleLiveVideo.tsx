"use client";
import QuillEditor from "@/components/base/EditorQuill";
import { Button } from "@/components/ui/button";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import parse from "html-react-parser";
import {
  CalendarClock,
  Clock,
  ExternalLink,
  PlayCircle,
  Radio,
  UserRound,
} from "lucide-react";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  materialData: TModuleMaterial | undefined;
};

type LiveRecordingVideo = {
  id?: string;
  guid?: string;
  name?: string;
  url?: string;
  videoUrl?: string;
  embedUrl?: string;
  videoLibraryId?: number;
};

export const ModuleLiveVideo = ({ materialData }: Props) => {
  const router = useRouter();
  const params = useParams<{
    slug?: string | string[];
    section?: string | string[];
    module?: string | string[];
  }>();
  const [userNote, setUserNote] = useState<string>(
    materialData?.userNote || ""
  );
  const [isJoiningLive, setIsJoiningLive] = useState(false);
  const liveData = materialData?.videoLive;
  const instructorName =
    materialData?.instructorName?.trim() ||
    liveData?.instructorName?.trim() ||
    "Nama pengajar belum tersedia";
  const startAt = liveData?.startAt ? moment(liveData.startAt) : null;
  const endAt = liveData?.endAt ? moment(liveData.endAt) : null;
  const recordingVideo = liveData?.video as LiveRecordingVideo | undefined;
  const getRecordingVideoUrl = () => {
    if (materialData?.videoUrl) {
      return materialData.videoUrl;
    }

    if (!recordingVideo) {
      return "";
    }

    if (recordingVideo.embedUrl || recordingVideo.videoUrl || recordingVideo.url) {
      return recordingVideo.embedUrl || recordingVideo.videoUrl || recordingVideo.url || "";
    }

    const recordingId = recordingVideo.guid || recordingVideo.id;

    if (recordingVideo.videoLibraryId && recordingId) {
      return `https://iframe.mediadelivery.net/embed/${recordingVideo.videoLibraryId}/${recordingId}`;
    }

    return recordingId
      ? `https://iframe.mediadelivery.net/embed/${recordingId}`
      : "";
  };
  const isLiveUpcoming = startAt ? startAt.isAfter(moment()) : false;
  const isLiveEnded = endAt ? endAt.isBefore(moment()) : false;
  const recordingVideoUrl = getRecordingVideoUrl();
  const hasRecordingVideo = Boolean(recordingVideoUrl);
  const showRecordingVideo = isLiveEnded && hasRecordingVideo;
  const showRecordingUnavailable = isLiveEnded && !hasRecordingVideo;
  const showLiveSchedule = Boolean(liveData) && !isLiveEnded;
  const canJoinLive =
    Boolean(liveData?.link) &&
    Boolean(startAt) &&
    Boolean(endAt) &&
    !isLiveUpcoming &&
    !isLiveEnded;
  const liveStatus = !startAt || !endAt
    ? {
        label: "Jadwal Belum Lengkap",
        className: "bg-muted text-muted-foreground",
      }
    : isLiveUpcoming
    ? {
        label: "Belum Berlangsung",
        className: "bg-yellow-100 text-yellow-800",
      }
    : isLiveEnded
      ? {
          label: "Sudah Berlangsung",
          className: "bg-blue-100 text-blue-800",
        }
      : {
          label: "Sedang Berlangsung",
          className: "bg-green-100 text-green-800",
        };

  const getRouteParam = (value?: string | string[]) => {
    if (Array.isArray(value)) {
      return value.at(0) || "";
    }

    return value || "";
  };

  const handleJoinLive = async () => {
    if (!canJoinLive) return;

    const liveLink = liveData?.link || "";

    if (!liveLink) {
      toast.error("Link live belum tersedia");
      return;
    }

    const liveWindow = window.open("about:blank", "_blank");
    if (liveWindow) {
      liveWindow.opener = null;
    }
    setIsJoiningLive(true);

    try {
      const response = await fetchApi<ApiResponse>(
        "/classroom/access-video-live-link",
        {
          method: "POST",
          body: {
            videoLiveId: liveData?.id || "",
            moduleId: materialData?.id || "",
            sectionSlug: getRouteParam(params.section),
            classSlug: getRouteParam(params.slug),
            moduleSlug: getRouteParam(params.module),
          },
        }
      );

      if (!response?.success) {
        liveWindow?.close();
        toast.error(response?.message || "Gagal mengakses live");
        return;
      }

      if (liveWindow) {
        liveWindow.location.href = liveLink;
      } else {
        window.open(liveLink, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      liveWindow?.close();
      console.error("Gagal mengakses live:", error);
      toast.error("Gagal mengakses live");
    } finally {
      setIsJoiningLive(false);
    }
  };

  useEffect(() => {
    if (!endAt || isLiveEnded) {
      return;
    }

    const timeUntilLiveEnds = Math.max(endAt.diff(moment()) + 1000, 0);
    const timer = window.setTimeout(() => {
      router.refresh();
    }, Math.min(timeUntilLiveEnds, 2_147_483_647));

    return () => window.clearTimeout(timer);
  }, [endAt, isLiveEnded, router]);

  useEffect(() => {
    // Auto-save dengan debounce (1 detik setelah user berhenti mengetik)
    const timer = setTimeout(() => {
      if (userNote.trim() !== "") {
        //TODO save ke backend
        if (userNote !== materialData?.userNote) {
          toast.info("Menyimpan Catatan...");
          saveData(userNote);
        }
      }
    }, 1000);
    return () => clearTimeout(timer); // Cleanup timer
  }, [userNote]);

  const saveData = async (content: string) => {
    try {
      await fetchApi(`/classroom/save-notes`, {
        method: "POST",
        body: {
          productId: materialData?.productId,
          moduleId: materialData?.id,
          notes: content,
        },
      });
    } catch (error) {
      console.error("Gagal menyimpan:", error);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
  ];
  return (
    <div className={showRecordingVideo ? "" : "w-[70%] mx-auto"}>
      <div className="flex lg:flex-row flex-col gap-4">
        {!liveData && (
          <div className="lg:w-[70%]">
            <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed bg-card p-8">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Radio className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold">Live Belum Tersedia</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Detail sesi live akan tampil setelah pengajar menjadwalkannya.
                </p>
              </div>
            </div>
          </div>
        )}
        {showLiveSchedule && (
          <>
            <div className="mt-4 w-full rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Radio className="h-5 w-5" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold">
                        {materialData?.title || "Sesi Live"}
                      </h1>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Ikuti sesi live sesuai jadwal bersama pengajar.
                      </p>
                    </div>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${liveStatus.className}`}
                  >
                    {liveStatus.label}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border bg-background p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UserRound className="h-4 w-4" />
                      Pengajar
                    </div>
                    <p className="mt-2 font-semibold">{instructorName}</p>
                  </div>
                  <div className="rounded-lg border bg-background p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarClock className="h-4 w-4" />
                      Waktu Mulai
                    </div>
                    <p className="mt-2 font-semibold">
                      {startAt
                        ? startAt.format("dddd, DD MMMM YYYY, hh:mm A")
                        : "-"}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-background p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Waktu Selesai
                    </div>
                    <p className="mt-2 font-semibold">
                      {endAt
                        ? endAt.format("dddd, DD MMMM YYYY, hh:mm A")
                        : "-"}
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={!canJoinLive || isJoiningLive}
                  onClick={handleJoinLive}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {isJoiningLive ? "Membuka Live..." : "Join Live"}
                </Button>
              </div>
            </div>
          </>
        )}

        {showRecordingUnavailable && (
          <div className="w-full">
            <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed bg-card p-8">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Radio className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold">
                  Rekaman Live Belum Tersedia
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sesi live sudah selesai. Rekaman akan tampil di sini setelah
                  video diproses dan tersedia.
                </p>
                <div className="mt-5 rounded-lg border bg-background p-4 text-left">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserRound className="h-4 w-4" />
                    Pengajar
                  </div>
                  <p className="mt-2 font-semibold">{instructorName}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showRecordingVideo && (
          <div className="lg:w-[70%]">
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="border-b p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <PlayCircle className="h-5 w-5" />
                    </span>
                    <div>
                      <h1 className="text-xl font-semibold">
                        Rekaman Live
                      </h1>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {materialData?.title || "Tonton ulang sesi live"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${liveStatus.className}`}
                  >
                    {liveStatus.label}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border bg-background p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UserRound className="h-4 w-4" />
                      Pengajar
                    </div>
                    <p className="mt-2 font-semibold">{instructorName}</p>
                  </div>
                  <div className="rounded-lg border bg-background p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarClock className="h-4 w-4" />
                      Mulai
                    </div>
                    <p className="mt-2 text-sm font-semibold">
                      {startAt
                        ? startAt.format("DD MMMM YYYY, hh:mm A")
                        : "-"}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-background p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Selesai
                    </div>
                    <p className="mt-2 text-sm font-semibold">
                      {endAt
                        ? endAt.format("DD MMMM YYYY, hh:mm A")
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-black">
                <div className="relative aspect-video w-full">
                  <iframe
                    src={`${materialData?.videoUrl || recordingVideoUrl}&autoplay=false&loop=false&muted=false&preload=true&responsive=false`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full border-0"
                    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        )}
        {showRecordingVideo && (
          <div className="lg:w-[30%]">
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-3">
                <h2 className="font-semibold">Catatan</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tulis poin penting dari rekaman live ini.
                </p>
              </div>
              <div className="h-[65vh]">
                <QuillEditor
                  getEditorContent={userNote}
                  setEditorContent={setUserNote}
                  className="h-[55vh]"
                  placeholder="Start ty ping..."
                  modules={modules}
                  formats={formats}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {materialData?.description && (
        <div className="p-4 bg-card h-[100%] rounded-lg mt-4">
          {parse(materialData?.description || "")}
        </div>
      )}
      {/* <div className="w-full mt-4">
        {materialData.file[0]?.name !== "" && (
          <Button asChild className="w-full">
            <Link href={materialData.file[0]?.name|| ""} target="_blank">
              Akses Materi
            </Link>
          </Button>
        )}
      </div> */}
    </div>
  );
};

"use client";
import QuillEditor from "@/components/base/EditorQuill";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/utils/fetchApi";
import parse from "html-react-parser";
import { Info } from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  materialData: TModuleMaterial | undefined;
};

export const ModuleLiveVideo = ({ materialData }: Props) => {
  const [userNote, setUserNote] = useState<string>(
    materialData?.userNote || ""
  );

  useEffect(() => {
    console.log(materialData);
  }, []);

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
    <div className={materialData?.videoUrl ? "" : "w-[70%] mx-auto"}>
      <div className="flex lg:flex-row flex-col gap-4">
        {materialData?.videoLive === null && (
          <div className="lg:w-[70%]">
            <div className="flex items-center justify-center h-[56.25%] w-full">
              <span className="text-center text-lg font-semibold">
                Live Belum Tersedia
              </span>
            </div>
          </div>
        )}
        {materialData?.videoLive !== null && !materialData?.videoUrl && (
          <>
            {materialData?.videoLive?.link && (
              <div className="p-4 bg-card w-full h-[100%] rounded-lg mt-4">
                <div className="flex flex-col justify-center w-full h-full">
                  <h1 className="text-lg mb-2">Judul</h1>
                  {/* TODO judul live */}
                  {/* Apakah Judul sama dengan nama produk atau beda */}
                  <div className="mb-4">
                    <div className="grid grid-cols-2 w-[35%] gap-2">
                      <div>Nama Pengajar</div>
                      <div></div>
                      <div>Waktu Mulai</div>
                      <div className="text-nowrap">
                        {": "}
                        {moment(materialData.videoLive.startAt).format(
                          "dddd, DD MMMM YYYY, hh:mm A"
                        )}
                      </div>
                      <div>Waktu Selesai</div>
                      <div className="text-nowrap">
                        {": "}
                        {moment(materialData.videoLive.endAt).format(
                          "dddd, DD MMMM YYYY, hh:mm A"
                        )}
                      </div>
                      <div>Status</div>
                      <div>
                        :{" "}
                        {moment(materialData.videoLive.startAt).isAfter(
                          moment()
                        ) ? (
                          <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-sm font-medium">
                            Belum Berlangsung
                          </span>
                        ) : moment(materialData.videoLive.endAt).isBefore(
                            moment()
                          ) ? (
                          <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm font-semibold">
                            Sudah Berlangsung
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-sm font-semibold">
                            Sedang Berlangsung
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <Link
                      href={
                        moment(materialData.videoLive.startAt).isAfter(
                          moment()
                        ) ||
                        moment(materialData.videoLive.endAt).isBefore(moment())
                          ? "#"
                          : materialData.videoLive.link
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={
                        moment(materialData.videoLive.startAt).isAfter(
                          moment()
                        ) ||
                        moment(materialData.videoLive.endAt).isBefore(moment())
                      }
                      tabIndex={
                        moment(materialData.videoLive.startAt).isAfter(
                          moment()
                        ) ||
                        moment(materialData.videoLive.endAt).isBefore(moment())
                          ? -1
                          : 0
                      }
                      className={
                        moment(materialData.videoLive.startAt).isAfter(
                          moment()
                        ) ||
                        moment(materialData.videoLive.endAt).isBefore(moment())
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    >
                      Join Live
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {materialData?.videoUrl && (
          <div className="lg:w-[70%]">
            <div className="relative pt-[56.25%] absolute top-0 left-0 w-full h-full">
              <iframe
                src={`${materialData?.videoUrl}&autoplay=false&loop=false&muted=false&preload=true&responsive=false`}
                loading="lazy"
                className="border-0 absolute top-0 h-full w-full"
                allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
        {materialData?.videoUrl && (
          <div className="lg:w-[30%]">
            <div className="p-4 bg-card rounded-lg">
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

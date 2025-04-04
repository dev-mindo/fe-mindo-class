"use client";
import QuillEditor from "@/components/base/EditorQuill";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/utils/fetchApi";
import parse from "html-react-parser";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  materialData: TModuleMaterial | undefined;
};

export const ModuleVideo = ({ materialData }: Props) => {
  const [userNote, setUserNote] = useState<string>(
    materialData?.userNote || ""
  );  

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
    <div>
      <div className="flex lg:flex-row flex-col gap-4">
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
      <div className="w-full mt-4">
        {materialData?.file !== "" && (
          <Button asChild className="w-full">
            <Link href={materialData?.file || ""} target="_blank">
              Akses Materi
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

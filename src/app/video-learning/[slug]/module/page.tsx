"use client";
import QuillEditor from "@/components/base/EditorQuill";
import ICard from "@/components/base/ICard";
import { Button } from "@/components/ui/button";

export default function Page() {
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
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
    "link",
    "image",
  ];
  return (
    <div>
      <div className="flex gap-4">
        <div className="w-[70%]">
          <div className="relative pt-[56.25%] absolute top-0 left-0 w-full h-full">
            <iframe
              src="https://iframe.mediadelivery.net/embed/369705/3ceaefe6-36d3-44dc-8203-1cb9792685e3?autoplay=false&loop=false&muted=false&preload=true&responsive=true"
              loading="lazy"
              className="border-0 absolute top-0 h-full w-full"
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        <div>
          <div className="p-4 bg-card h-[100%] rounded-lg">
            <QuillEditor
              className="h-[40vh]"
              placeholder="Start ty ping..."
              modules={modules}
              formats={formats}
            />
          </div>
        </div>
      </div>
      <div className="p-4 bg-card h-[100%] rounded-lg mt-4">
        <h1 className="mb-2 text-xl font-bold">
          Food Safety Management System
        </h1>
        <p>
          Food Safety Management System (FSMS) adalah sistem yang memastikan
          keamanan pangan melalui identifikasi, pencegahan, dan pengendalian
          bahaya dalam proses produksi dan distribusi makanan. FSMS mencakup
          standar seperti HACCP dan ISO 22000, kepatuhan regulasi, dokumentasi,
          pelatihan karyawan, serta pemantauan berkelanjutan. Dengan FSMS,
          bisnis makanan dapat meningkatkan kualitas, kepercayaan konsumen, dan
          kepatuhan terhadap regulasi industri.
        </p>
      </div>
      <div className="w-full mt-4">
        <Button className="w-full">Akses Materi</Button>
      </div>
    </div>
  );
}

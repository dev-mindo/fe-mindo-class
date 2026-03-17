import { NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

export const runtime = "nodejs"; // pastikan berjalan di server, bukan edge

export async function POST(req: Request) {
  try {
    // Ambil FormData dari request frontend
    const incomingForm = await req.formData();
    const video = incomingForm.get("video") as File;
    const title = incomingForm.get("title") as string;

    if (!video) {
      return NextResponse.json(
        { error: "File video tidak ditemukan" },
        { status: 400 }
      );
    }

    // Konversi File ke Buffer (agar bisa dikirim ke Node.js API)
    const videoBuffer = Buffer.from(await video.arrayBuffer());

    // Buat FormData baru untuk dikirim ke API backend
    const formData = new FormData();
    formData.append("video", videoBuffer, video.name);
    formData.append("title", title);

    // Kirim ke backend Node.js API
    const uploadVideoRes = await axios.post(
      `${process.env.API_URL}/admin/video/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        ...({
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          onUploadProgress: (event: any) => {
            console.log("event", event);
            const percent = Math.round((event.loaded * 100) / event.total);
            console.log(`Upload progress: ${percent}%`);
          },
        } as any),
      }
    );

    return NextResponse.json(uploadVideoRes.data, { status: 200 });
  } catch (error: any) {
    console.error("Upload error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Gagal upload video", details: error.message },
      { status: 500 }
    );
  }
}

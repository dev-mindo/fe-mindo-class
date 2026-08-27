import { NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const apiUrl = process.env.API_URL;

    if (!apiUrl) {
      return NextResponse.json(
        { message: "API_URL belum dikonfigurasi" },
        { status: 500 }
      );
    }

    const incomingForm = await req.formData();
    const pdf = incomingForm.get("pdf") as File | null;

    if (!pdf) {
      return NextResponse.json(
        { message: "File PDF tidak ditemukan" },
        { status: 400 }
      );
    }

    if (pdf.type && pdf.type !== "application/pdf") {
      return NextResponse.json(
        { message: "File harus berupa PDF" },
        { status: 400 }
      );
    }

    const pdfBuffer = Buffer.from(await pdf.arrayBuffer());
    const formData = new FormData();
    formData.append("file", pdfBuffer, {
      filename: pdf.name,
      contentType: "application/pdf",
    });

    const uploadPath =
      process.env.PDF_TEMPLATE_UPLOAD_PATH || "/pdf-lib/templates/upload";
    const uploadResponse = await axios.post(
      `${apiUrl}${uploadPath}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          ...(process.env.API_KEY ? { "aws-api-key": process.env.API_KEY } : {}),
        },
        ...({
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        } as any),
      }
    );

    return NextResponse.json(uploadResponse.data, { status: 200 });
  } catch (error: any) {
    console.error(
      "Upload PDF template error:",
      error.response?.data || error.message
    );

    return NextResponse.json(
      error.response?.data || {
        message: "Gagal upload template PDF",
        details: error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

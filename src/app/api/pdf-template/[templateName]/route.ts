import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: {
    templateName: string;
  };
};

export async function GET(_request: NextRequest, { params }: Props) {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { message: "API_URL belum dikonfigurasi" },
      { status: 500 }
    );
  }

  const templateName = decodeURIComponent(params.templateName);
  const templateUrl = new URL(
    `/pdf-lib/templates/${encodeURIComponent(templateName)}`,
    apiUrl
  );

  const response = await fetch(templateUrl, {
    headers: {
      ...(process.env.API_KEY ? { "aws-api-key": process.env.API_KEY } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok || !response.body) {
    return NextResponse.json(
      { message: "Gagal mengambil template PDF" },
      { status: response.status || 500 }
    );
  }

  return new NextResponse(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/pdf",
      "Cache-Control": "no-store",
    },
  });
}

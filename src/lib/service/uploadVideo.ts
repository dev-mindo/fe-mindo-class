"use server"
import axios from "axios";

export const UploadVideo = async (
  videoFile: File,
  title: string,
  onProgress?: (progress: number) => void
) => {
  try {
    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("title", title);

    const uploadVideoRes = await axios.post(
      `${process.env.API_URL}/admin/video/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // ✅ tampilkan progress upload
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

    return uploadVideoRes.data; // ✅ return hasil dari server
  } catch (error: any) {
    console.error("Upload video failed:", error);
    throw error;
  }
};

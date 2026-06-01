"use client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UploadVideoDialog } from "./_component/UploadVideoDialog";
import { ListVideo } from "./_component/ListVideo";
import UploadProgressCard, {
  UploadProgress,
} from "./_component/ProgressCardProps";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  DocumentData,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  Timestamp,
} from "@firebase/firestore";
import { firebaseDB } from "@/lib/config/firebase";
import useAnonymousAuth from "@/hooks/useAnonymousAuth";
import { DashboardPageTitle } from "../_component/page-title";

interface Progress {
  id: string;
  text: string;
  uid: string;
  displayName: string;
  createdAt: Timestamp; // Gunakan tipe Timestamp dari Firebase
  // Tambahkan field lain yang Anda simpan
}

export interface progressVideo {
  id: string;
  filename: string;
  progress: number;
}

const Page = () => {
  const { user, loading } = useAnonymousAuth();
  const [openDialogVideo, setOpenDialogVideo] = useState<boolean>(false);
  const [uploadsProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [messages, setMessages] = useState<Progress[]>([]);
  const [onVideoUploadId, setOnVideoUploadId] = useState<string[]>([]);

  const handleUploadProgress = (value: progressVideo) => {
    console.log(value);

    switch (value.progress) {
      case 0:
        setUploadProgress([
          {
            ...value,
            progress: 0,
          },
        ]);
        break;
      case 1:
        setUploadProgress([
          {
            ...value,
            progress: 40,
          },
        ]);
        break;
      case 2:
        setUploadProgress([
          {
            ...value,
            progress: 60,
          },
        ]);
        break;
      case 4:
        setUploadProgress([
          {
            ...value,
            progress: 80,
          },
        ]);
        break;
      case 3:
        setUploadProgress([
          {
            ...value,
            progress: 100,
          },
        ]);

        // Setelah progress 100 tampil → tunggu 10 detik → reset progress
        setTimeout(() => {
          setUploadProgress([]);
        }, 10000); // 10 detik
        break;
    }
  };

  useEffect(() => {
    // Query untuk mengambil pesan, diurutkan berdasarkan waktu pembuatan
    const q = query(
      collection(firebaseDB, "progress"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    // onSnapshot akan mendengarkan perubahan secara real-time
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const msgs: Progress[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const progressData = doc.data() as Omit<Progress, "id">;
          msgs.push({
            id: doc.id,
            ...progressData,
          } as Progress);
        });
        setMessages(msgs);
        // setUploadProgress(msgs[0].text.VideoGuid)        

        console.log('Upload Progress', uploadsProgress)
        
        handleUploadProgress({
          ...uploadsProgress[0],
          progress: msgs[0].text.Status,
        });
      },
      (error) => {
        console.error("Error listening to messages:", error);
      }
    );

    // Clean-up function untuk berhenti mendengarkan ketika komponen dilepas
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log("data message", messages);
  }, [messages]);

  useEffect(() => {
    console.log('upload progress data', uploadsProgress)
  }, [uploadsProgress])

  return (
    <div className="w-full">
      <DashboardPageTitle title="Video" />
      <div>
        <div className="flex justify-between items-center mb-4">
          <div></div>
          <div>
            {/* <Button
              onClick={() => {
                setOpenDialogVideo(true);
              }}
            >
              Tambah Video
            </Button> */}
          </div>
        </div>
        <ListVideo />
      </div>
      {/* <UploadVideoDialog
        isOpen={openDialogVideo}
        setIsOpenDialog={setOpenDialogVideo}
        handleUploadProgress={handleUploadProgress}
      /> */}
      {/* <UploadProgressCard uploads={uploadsProgress} /> */}
    </div>
  );
};

export default Page;

"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import parse from "html-react-parser";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";

type Props = {
  assignment: TAssignment | undefined;
  intruction: string | undefined;
  intructionLink: TFile[] | undefined;
};

export const Task = ({ intructionLink, intruction, assignment }: Props) => {
  const [collectionAssignment, setCollectionAssignment] =
    useState<TTaskUser | null>(null);
  const [isEditable, setIsEditable] = useState<boolean>(true);
  const [editTask, setEditTask] = useState<boolean>(false);
  const [taskId, setTaskId] = useState<number>(0);
  const [task, setTask] = useState<string>("");
  const [isLate, setIsLate] = useState<boolean>(false);

  const handleEditTask = () => {
    if (!editTask) setEditTask(true);
  };

  const handleSaveTask = async () => {
    await fetchApi<ApiResponse<TTaskUser>>(
      `/assignment/${assignment?.id}/save`,
      {
        method: "POST",
        body: {
          uploadUrl: task,
        },
      }
    )
      .then((userTask) => {
        if (userTask) {
          if (!userTask.success) {
            toast.error(userTask.message);
          } else {
            console.log(userTask);
            setEditTask(false);
            setCollectionAssignment(userTask.data ?? null);
            toast.success("Tugas Berhasil Simpan");
          }
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Gagal menyimpan tugas");
      });
  };

  useEffect(() => {    
    const checkLate = assignment &&
      new Date() > new Date(assignment.endAt)&&
      !assignment.canLate ? true : false

      console.log('check late', checkLate)

    setIsLate(checkLate)
    if (assignment && assignment.taskUser.length > 0) {
      setCollectionAssignment(assignment.taskUser.at(0) || null);
    } else if (!checkLate) {
      setEditTask(true);
    }
  }, []);

  return (
    <>
      <div className="mx-auto w-[70%] flex flex-col gap-4">
        <div className="p-4 bg-card h-[100%] rounded-lg mt-4">
          <div className="flex flex-col gap-2">
            <div className="text-xl font-bold mb-1">Intruksi Pengumpulan</div>
            <p className="">
              {parse(intruction || "") || "Tidak ada intruksi"}
            </p>
            <div className="flex gap-2 mt-4">
              {intructionLink?.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <a href={item.url} target="_blank">
                    <Button>{item.name}</Button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Info</AlertTitle>
          <AlertDescription>
            Batas Waktu Pengumpulan{" "}
            {moment(assignment?.endAt).format("DD-MM-YYYY")}{" "}
            {assignment?.canLate ? "(Boleh Terlambat)" : ""}
          </AlertDescription>
        </Alert>
        <div className="p-4 bg-card h-[100%] rounded-lg flex flex-col gap-4">
          <div className="text-lg">Pengumpulan</div>
          <div className="grid grid-cols-2 w-[35%] gap-2 text-nowrap">
            <div className="">Status Pengumpulan</div>
            <p>
              {": "}
              {collectionAssignment
                ? collectionAssignment.status === "SUBMITTED"
                  ? "Sudah Mengumpulkan"
                  : collectionAssignment.status === "SUBMITTED_LATE"
                  ? "Sudah Mengumpulkan (Terlambat)"
                  : collectionAssignment.status === "ASSESSED"
                  ? "Dinilai"
                  : "Belum Mengumpulkan"
                : "Belum Mengumpulkan"}
            </p>
            <div>Tanggal Pengumpulan</div>
            <p>
              {": "}
              {collectionAssignment
                ? moment(collectionAssignment.createdAt).format("LLLL")
                : "Belum Mengumpulkan"}
            </p>
          </div>
          <div>
            <div className="flex gap-2">
              <Input
                disabled={
                  (!assignment?.editable && collectionAssignment !== null) ||
                  (assignment?.editable && !editTask)
                }
                onChange={(e) => setTask(e.target.value)}
                defaultValue={
                  collectionAssignment ? collectionAssignment.uploadUrl : ""
                }
                className="mb-1"
                placeholder="Pengumpulan URL tugas Disini"
              />
              {editTask ? (
                <Button onClick={handleSaveTask}>Save</Button>
              ) : (
                <Button
                  disabled={!assignment?.editable || !isLate}
                  onClick={handleEditTask}
                >
                  Edit
                </Button>
              )}
            </div>
            <p className="text-sm mt-1">
              Tugas{" "}
              {isLate ? (
                <b className="text-red-500">
                  Sudah tidak bisa mengumpulkan karena melewati batas waktu
                </b>
              ) : assignment?.editable ? (
                <b>Bisa Diedit</b>
              ) : (
                <b className="text-red-500">Tidak Bisa Diedit</b>
              )}
            </p>
          </div>
        </div>
        <div className="p-4 bg-card h-[100%] rounded-lg flex flex-col gap-4">
          <div>
            Ada pertanyaan mengenai tugas? Silahkan dicantumkan dibawah ini
          </div>
          <div>
            <div className="flex flex-col gap-2">
              {/* Contoh pesan admin */}
              <div className="flex justify-start">
                <div
                  className="px-4 py-2 rounded-lg max-w-xs"
                  style={{
                    background: "hsl(var(--secondary))",
                    color: "hsl(var(--secondary-foreground))",
                  }}
                >
                  Halo, ada yang bisa kami bantu?
                </div>
              </div>
              {/* Contoh pesan user */}
              <div className="flex justify-end">
                <div
                  className="px-4 py-2 rounded-lg max-w-xs"
                  style={{
                    background: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                  }}
                >
                  Saya ingin bertanya tentang tugas.
                </div>
              </div>
              {/* Input chat */}
              <div className="flex gap-2 mt-2">
                <Input placeholder="Ketik pesan..." disabled />
                <Button disabled>Kirim</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

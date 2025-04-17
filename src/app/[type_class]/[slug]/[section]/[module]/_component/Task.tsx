"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Task = () => {
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [editTask, setEditTask] = useState<boolean>(false);
  const [taskId, setTaskId] = useState<number>(1)

  const handleEditTask = () => {
    if (!editTask) setEditTask(true);
  };

  const handleSaveTask = () => {
    setEditTask(false);
    toast.success('Tugas Berhasil Simpan')
  };

  return (
    <>
      <div className="mx-auto w-[70%] flex flex-col gap-4">
        <div className="p-4 bg-card h-[100%] rounded-lg mt-4">
          <div className="flex flex-col gap-2">
            <div className="text-xl font-bold mb-1">Intruksi Pengumpulan</div>
            <p className="">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged.
            </p>
            <div>
              <Button>Akses Intruksi Pengumpulan</Button>
            </div>
          </div>
        </div>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Info</AlertTitle>
          <AlertDescription>
            Batas Waktu Pengumpulan 01-05-2025 (Boleh Terlambat)
          </AlertDescription>
        </Alert>
        <div className="p-4 bg-card h-[100%] rounded-lg flex flex-col gap-4">
          <div className="">Pengumpulan</div>
          <div>
            <div className="flex gap-2">
              <Input
                disabled={!isEditable && taskId > 0 || isEditable && !editTask}
                value="https://classroom-mindo.b-cdn.net/document/A_line_follower_robot_from_design_to_imp.pdf"
                className="mb-1"
              />
              {editTask ? (
                <Button onClick={handleSaveTask}>Save</Button>
              ) : (
                <Button disabled={!isEditable} onClick={handleEditTask}>
                  Edit
                </Button>
              )}
            </div>
            <p className="text-sm">
              Tugas {
                isEditable ?
                <b>Bisa Diedit</b>
                : <b>Tidak Bisa Diedit</b>
              }
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

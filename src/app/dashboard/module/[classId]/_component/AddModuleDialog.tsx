"use client";
import IInput from "@/components/base/IInput";
import ISelect from "@/components/base/ISelect";
import ISwitch from "@/components/base/ISwitch";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
  isOpen: boolean;
  section: {
    label: string;
    value: string;
  }[];
};

export const AddModuleDialog = (props: Props) => {
  const [isOpen, setIsOpen] = useState(props.isOpen);
  const form = useForm();

  const onFinish = async (value: any) => {};

  return (
    <Dialog open={isOpen}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFinish)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Module</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label>Section</Label>
                <ISelect
                  control={form.control}
                  name=""
                  options={props.section}
                ></ISelect>
              </div>
              <div className="grid gap-3">
                <Label>Judul</Label>
                <IInput control={form.control} name=""></IInput>
              </div>
              <div className="grid gap-3">
                <Label>Tipe Modul</Label>
                <ISelect
                  control={form.control}
                  name=""
                  options={props.section}
                ></ISelect>
              </div>
              <div className="grid gap-3">
                <Label>Step</Label>
                <IInput control={form.control} name=""></IInput>
              </div>
              <div className="grid gap-3">
                <Label>Judul Menu</Label>
                <IInput control={form.control} name=""></IInput>
              </div>
              <div className="grid gap-3">
                <Label>Sembunyikan</Label>
                <ISwitch control={form.control} name="Hide"></ISwitch>
              </div>
              <div className="grid gap-3">
                <Label>Terkunci</Label>
                <ISwitch control={form.control} name="Hide"></ISwitch>
              </div>
            </div>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
};

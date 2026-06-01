"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Pencil, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

export type ClassProductFormValues = {
  productType: string;
  publish: boolean;
  publishTime: string;
  title: string;
  isAutoGetCertificate: boolean;
};

type Props = {
  dataClass: TClassModuleDetail | null;
  isUpdating: boolean;
  onSubmit: (values: ClassProductFormValues) => Promise<boolean | void> | boolean | void;
};

const PRODUCT_TYPE_OPTIONS = ["VIDEO_LEARNING", "BOOTCAMP"];

const toDateTimeLocal = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const defaultValues: ClassProductFormValues = {
  productType: "VIDEO_LEARNING",
  publish: true,
  publishTime: "",
  title: "",
  isAutoGetCertificate: false,
};

const getFormValues = (dataClass: TClassModuleDetail | null) => {
  if (!dataClass) {
    return defaultValues;
  }

  return {
    productType: dataClass.productType || "VIDEO_LEARNING",
    publish: Boolean(dataClass.publish),
    publishTime: toDateTimeLocal(dataClass.publishTime),
    title: dataClass.title || "",
    isAutoGetCertificate: Boolean(dataClass.isAutoGetCertificate),
  };
};

export const ClassProductForm = ({
  dataClass,
  isUpdating,
  onSubmit,
}: Props) => {
  const [form, setForm] = useState<ClassProductFormValues>(defaultValues);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const productTypeOptions = useMemo(() => {
    if (
      dataClass?.productType &&
      !PRODUCT_TYPE_OPTIONS.includes(dataClass.productType)
    ) {
      return [dataClass.productType, ...PRODUCT_TYPE_OPTIONS];
    }

    return PRODUCT_TYPE_OPTIONS;
  }, [dataClass?.productType]);

  useEffect(() => {
    if (!dataClass) {
      return;
    }

    setForm(getFormValues(dataClass));
  }, [dataClass]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isEditing) {
      return;
    }

    const isSuccess = await onSubmit(form);

    if (isSuccess !== false) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setForm(getFormValues(dataClass));
    setIsEditing(false);
  };

  return (
    <Card className="rounded-lg shadow-sm">
      <CardHeader className="gap-2 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Detail Kelas</CardTitle>
            <CardDescription className="text-xs">
              Ubah informasi utama kelas.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">ID: {dataClass?.id ?? "-"}</Badge>
            <Badge variant={form.publish ? "default" : "secondary"}>
              {form.publish ? "Published" : "Draft"}
            </Badge>
            <Badge variant="outline">
              {dataClass?.sections.length ?? 0} Section
            </Badge>
            <Badge variant="outline">
              {dataClass?._count?.userClass ?? 0} Peserta
            </Badge>
            {!isEditing ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!dataClass}
                onClick={() => setIsEditing(true)}
              >
                <Pencil size={15} />
                Edit
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                className="h-9"
                disabled={!isEditing || isUpdating}
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Masukkan title kelas"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipe Produk</Label>
              <Select
                value={form.productType}
                disabled={!isEditing || isUpdating}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    productType: value,
                  }))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Pilih tipe produk" />
                </SelectTrigger>
                <SelectContent>
                  {productTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishTime">Publish Time</Label>
              <Input
                id="publishTime"
                type="datetime-local"
                className="h-9"
                disabled={!isEditing || isUpdating}
                value={form.publishTime}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    publishTime: event.target.value,
                  }))
                }
              />
            </div>

            <div className="rounded-md bg-muted px-3 py-2">
              <p className="text-xs text-muted-foreground">Created At</p>
              <p className="truncate text-sm font-medium">
                {formatDateTime(dataClass?.createdAt)}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2.5">
              <div>
                <Label htmlFor="publish" className="text-sm">
                  Publish
                </Label>
                <p className="text-xs text-muted-foreground">
                  Status kelas tampil untuk user.
                </p>
              </div>
              <Switch
                id="publish"
                disabled={!isEditing || isUpdating}
                checked={form.publish}
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, publish: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2.5">
              <div>
                <Label htmlFor="isAutoGetCertificate" className="text-sm">
                  Auto Get Certificate
                </Label>
                <p className="text-xs text-muted-foreground">
                  Sertifikat otomatis aktif.
                </p>
              </div>
              <Switch
                id="isAutoGetCertificate"
                disabled={!isEditing || isUpdating}
                checked={form.isAutoGetCertificate}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    isAutoGetCertificate: checked,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={handleCancelEdit}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUpdating || !dataClass}
                >
                  <Save size={16} />
                  {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

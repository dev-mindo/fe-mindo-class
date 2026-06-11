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
import {
  Check,
  ChevronDown,
  Loader2,
  Pencil,
  Save,
  Search,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, UIEvent } from "react";

export type ClassProductFormValues = {
  instructorId: string;
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

type InstructorOption = {
  id: string;
  name: string;
  username: string;
  role: "PIC" | "PENGAJAR";
};

const INSTRUCTOR_OPTIONS: InstructorOption[] = [
  { id: "1", name: "Aulia Rahman", username: "aulia.pic", role: "PIC" },
  {
    id: "2",
    name: "Siti Rahma",
    username: "siti.rahma",
    role: "PENGAJAR",
  },
  {
    id: "3",
    name: "Budi Santoso",
    username: "budi.santoso",
    role: "PENGAJAR",
  },
  { id: "4", name: "Nadia Putri", username: "nadia.pic", role: "PIC" },
  {
    id: "5",
    name: "Rizky Maulana",
    username: "rizky.maulana",
    role: "PENGAJAR",
  },
  {
    id: "6",
    name: "Dewi Lestari",
    username: "dewi.lestari",
    role: "PENGAJAR",
  },
  { id: "7", name: "Fajar Nugraha", username: "fajar.pic", role: "PIC" },
  {
    id: "8",
    name: "Maya Sari",
    username: "maya.sari",
    role: "PENGAJAR",
  },
  {
    id: "9",
    name: "Ahmad Fauzi",
    username: "ahmad.fauzi",
    role: "PENGAJAR",
  },
  { id: "10", name: "Rina Wulandari", username: "rina.pic", role: "PIC" },
  {
    id: "11",
    name: "Dimas Saputra",
    username: "dimas.saputra",
    role: "PENGAJAR",
  },
  {
    id: "12",
    name: "Putri Ananda",
    username: "putri.ananda",
    role: "PENGAJAR",
  },
  { id: "13", name: "Yoga Pratama", username: "yoga.pic", role: "PIC" },
  {
    id: "14",
    name: "Nanda Permata",
    username: "nanda.permata",
    role: "PENGAJAR",
  },
  {
    id: "15",
    name: "Ilham Ramadhan",
    username: "ilham.ramadhan",
    role: "PENGAJAR",
  },
];

const INSTRUCTOR_BATCH_SIZE = 5;

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
  instructorId: "",
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

  const classWithInstructor = dataClass as TClassModuleDetail & {
    instructorId?: string | number | null;
    instructor?: { id?: string | number | null } | null;
  };

  return {
    instructorId: String(
      classWithInstructor.instructorId ??
        classWithInstructor.instructor?.id ??
        ""
    ),
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
  const [instructorSearch, setInstructorSearch] = useState("");
  const [isInstructorOpen, setIsInstructorOpen] = useState(false);
  const [visibleInstructorCount, setVisibleInstructorCount] = useState(
    INSTRUCTOR_BATCH_SIZE
  );
  const [isLoadingMoreInstructors, setIsLoadingMoreInstructors] =
    useState(false);
  const instructorComboboxRef = useRef<HTMLDivElement>(null);

  const productTypeOptions = useMemo(() => {
    if (
      dataClass?.productType &&
      !PRODUCT_TYPE_OPTIONS.includes(dataClass.productType)
    ) {
      return [dataClass.productType, ...PRODUCT_TYPE_OPTIONS];
    }

    return PRODUCT_TYPE_OPTIONS;
  }, [dataClass?.productType]);

  const filteredInstructors = useMemo(() => {
    const keyword = instructorSearch.trim().toLowerCase();

    if (!keyword) return INSTRUCTOR_OPTIONS;

    return INSTRUCTOR_OPTIONS.filter(
      (instructor) =>
        instructor.name.toLowerCase().includes(keyword) ||
        instructor.username.toLowerCase().includes(keyword) ||
        instructor.role.toLowerCase().includes(keyword)
    );
  }, [instructorSearch]);

  const selectedInstructor = INSTRUCTOR_OPTIONS.find(
    (instructor) => instructor.id === form.instructorId
  );
  const visibleInstructors = filteredInstructors.slice(
    0,
    visibleInstructorCount
  );
  const hasMoreInstructors =
    visibleInstructorCount < filteredInstructors.length;

  useEffect(() => {
    const closeInstructorCombobox = (event: MouseEvent) => {
      if (
        instructorComboboxRef.current &&
        !instructorComboboxRef.current.contains(event.target as Node)
      ) {
        setIsInstructorOpen(false);
        setInstructorSearch("");
      }
    };

    document.addEventListener("mousedown", closeInstructorCombobox);

    return () => {
      document.removeEventListener("mousedown", closeInstructorCombobox);
    };
  }, []);

  useEffect(() => {
    if (!dataClass) {
      return;
    }

    setForm(getFormValues(dataClass));
    setInstructorSearch("");
    setIsInstructorOpen(false);
    setVisibleInstructorCount(INSTRUCTOR_BATCH_SIZE);
  }, [dataClass]);

  useEffect(() => {
    setVisibleInstructorCount(INSTRUCTOR_BATCH_SIZE);
    setIsLoadingMoreInstructors(false);
  }, [instructorSearch]);

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
    setInstructorSearch("");
    setIsInstructorOpen(false);
    setVisibleInstructorCount(INSTRUCTOR_BATCH_SIZE);
    setIsEditing(false);
  };

  const handleInstructorScroll = (event: UIEvent<HTMLDivElement>) => {
    const list = event.currentTarget;
    const isNearBottom =
      list.scrollHeight - list.scrollTop - list.clientHeight < 40;

    if (
      !isNearBottom ||
      !hasMoreInstructors ||
      isLoadingMoreInstructors
    ) {
      return;
    }

    setIsLoadingMoreInstructors(true);
    window.setTimeout(() => {
      setVisibleInstructorCount((current) =>
        Math.min(
          current + INSTRUCTOR_BATCH_SIZE,
          filteredInstructors.length
        )
      );
      setIsLoadingMoreInstructors(false);
    }, 500);
  };

  const selectInstructor = (instructor: InstructorOption) => {
    setForm((current) => ({
      ...current,
      instructorId: instructor.id,
    }));
    setInstructorSearch("");
    setIsInstructorOpen(false);
    setVisibleInstructorCount(INSTRUCTOR_BATCH_SIZE);
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

          <div className="max-w-2xl space-y-2">
            <Label htmlFor="instructor-search">Instruktur</Label>
            <div ref={instructorComboboxRef} className="relative">
              {isInstructorOpen ? (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="instructor-search"
                    autoFocus
                    className="h-9 pl-9 pr-9"
                    disabled={!isEditing || isUpdating}
                    value={instructorSearch}
                    onChange={(event) =>
                      setInstructorSearch(event.target.value)
                    }
                    placeholder="Cari nama, username, atau role"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              ) : (
                <Button
                  id="instructor-search"
                  type="button"
                  variant="outline"
                  disabled={!isEditing || isUpdating}
                  className="h-9 w-full justify-between px-3 font-normal"
                  onClick={() => setIsInstructorOpen(true)}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                      {selectedInstructor
                        ? `${selectedInstructor.name} - ${selectedInstructor.username}`
                        : "Cari dan pilih instruktur"}
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Button>
              )}

              {isInstructorOpen ? (
                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
                  <div
                    className="max-h-56 overflow-y-auto p-1"
                    onScroll={handleInstructorScroll}
                  >
                    {visibleInstructors.map((instructor) => {
                      const isSelected =
                        instructor.id === form.instructorId;

                      return (
                        <button
                          key={instructor.id}
                          type="button"
                          className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                          onClick={() => selectInstructor(instructor)}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <UserRound className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {instructor.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {instructor.username} · {instructor.role}
                            </p>
                          </div>
                          {isSelected ? (
                            <Check className="h-4 w-4 shrink-0 text-primary" />
                          ) : null}
                        </button>
                      );
                    })}

                    {!visibleInstructors.length ? (
                      <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                        Instruktur tidak ditemukan
                      </div>
                    ) : null}

                    {isLoadingMoreInstructors ? (
                      <div className="flex items-center justify-center gap-2 px-3 py-3 text-xs text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Memuat instruktur...
                      </div>
                    ) : null}

                    {!hasMoreInstructors &&
                    visibleInstructors.length > INSTRUCTOR_BATCH_SIZE ? (
                      <p className="px-3 py-2 text-center text-xs text-muted-foreground">
                        Semua instruktur telah ditampilkan
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              Ketik untuk mencari, lalu scroll daftar untuk memuat data lainnya.
            </p>
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

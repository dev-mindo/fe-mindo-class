"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  GraduationCap,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardPageTitle } from "../_component/page-title";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type InstructorRole = "PIC" | "PENGAJAR";

type Instructor = {
  id: number;
  name: string;
  username: string;
  role: InstructorRole;
};

type InstructorForm = {
  name: string;
  username: string;
  password: string;
  role: InstructorRole | "";
};

const dummyInstructors: Instructor[] = [
  { id: 1, name: "Aulia Rahman", username: "aulia.pic", role: "PIC" },
  { id: 2, name: "Siti Rahma", username: "siti.rahma", role: "PENGAJAR" },
  { id: 3, name: "Budi Santoso", username: "budi.santoso", role: "PENGAJAR" },
  { id: 4, name: "Nadia Putri", username: "nadia.pic", role: "PIC" },
  { id: 5, name: "Rizky Maulana", username: "rizky.maulana", role: "PENGAJAR" },
  { id: 6, name: "Dewi Lestari", username: "dewi.lestari", role: "PENGAJAR" },
  { id: 7, name: "Fajar Nugraha", username: "fajar.pic", role: "PIC" },
  { id: 8, name: "Maya Sari", username: "maya.sari", role: "PENGAJAR" },
  { id: 9, name: "Ahmad Fauzi", username: "ahmad.fauzi", role: "PENGAJAR" },
  { id: 10, name: "Rina Wulandari", username: "rina.pic", role: "PIC" },
  { id: 11, name: "Dimas Saputra", username: "dimas.saputra", role: "PENGAJAR" },
];

const emptyForm: InstructorForm = {
  name: "",
  username: "",
  password: "",
  role: "",
};

const pageSize = 5;

export default function InstructorPage() {
  const [instructors, setInstructors] =
    useState<Instructor[]>(dummyInstructors);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState<InstructorForm>(emptyForm);
  const [editingInstructor, setEditingInstructor] =
    useState<Instructor | null>(null);
  const [deletingInstructor, setDeletingInstructor] =
    useState<Instructor | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const filteredInstructors = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return instructors.filter((instructor) => {
      const matchesKeyword =
        instructor.name.toLowerCase().includes(keyword) ||
        instructor.username.toLowerCase().includes(keyword);
      const matchesRole =
        roleFilter === "ALL" || instructor.role === roleFilter;

      return matchesKeyword && matchesRole;
    });
  }, [instructors, roleFilter, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInstructors.length / pageSize)
  );
  const paginatedInstructors = filteredInstructors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const resetForm = () => setForm(emptyForm);

  const validateForm = (currentId?: number, requirePassword = false) => {
    if (!form.name.trim() || !form.username.trim() || !form.role) {
      toast.error("Nama, username, dan role wajib diisi.");
      return false;
    }

    if (requirePassword && !form.password) {
      toast.error("Password wajib diisi.");
      return false;
    }

    const usernameExists = instructors.some(
      (instructor) =>
        instructor.id !== currentId &&
        instructor.username.toLowerCase() ===
          form.username.trim().toLowerCase()
    );

    if (usernameExists) {
      toast.error("Username sudah digunakan.");
      return false;
    }

    return true;
  };

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm(undefined, true)) return;

    setInstructors((currentInstructors) => [
      {
        id:
          Math.max(0, ...currentInstructors.map((instructor) => instructor.id)) +
          1,
        name: form.name.trim(),
        username: form.username.trim(),
        role: form.role as InstructorRole,
      },
      ...currentInstructors,
    ]);
    setCurrentPage(1);
    setIsCreateOpen(false);
    resetForm();
    toast.success("Instruktur berhasil ditambahkan.");
  };

  const openEditDialog = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setForm({
      name: instructor.name,
      username: instructor.username,
      password: "",
      role: instructor.role,
    });
    setIsEditOpen(true);
  };

  const handleEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingInstructor || !validateForm(editingInstructor.id)) return;

    setInstructors((currentInstructors) =>
      currentInstructors.map((instructor) =>
        instructor.id === editingInstructor.id
          ? {
              ...instructor,
              name: form.name.trim(),
              username: form.username.trim(),
              role: form.role as InstructorRole,
            }
          : instructor
      )
    );
    setIsEditOpen(false);
    setEditingInstructor(null);
    resetForm();
    toast.success("Data instruktur berhasil diperbarui.");
  };

  const handleDelete = () => {
    if (!deletingInstructor) return;

    setInstructors((currentInstructors) =>
      currentInstructors.filter(
        (instructor) => instructor.id !== deletingInstructor.id
      )
    );
    setDeletingInstructor(null);
    toast.success("Instruktur berhasil dihapus.");
  };

  return (
    <div className="w-full space-y-6">
      <DashboardPageTitle title="Instruktur" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Pengelolaan Instruktur
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola akun PIC dan pengajar yang menangani kegiatan pembelajaran.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Instruktur
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Daftar Instruktur</CardTitle>
            <CardDescription className="mt-1.5">
              Total {instructors.length} instruktur terdaftar
            </CardDescription>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Cari nama atau username..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="sm:w-40">
                <SelectValue placeholder="Semua role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua role</SelectItem>
                <SelectItem value="PIC">PIC</SelectItem>
                <SelectItem value="PENGAJAR">Pengajar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nama</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-32 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInstructors.map((instructor) => (
                  <TableRow key={instructor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <GraduationCap className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{instructor.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {instructor.username}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          instructor.role === "PIC" ? "default" : "secondary"
                        }
                      >
                        {instructor.role === "PIC" ? "PIC" : "Pengajar"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          aria-label={`Edit ${instructor.name}`}
                          onClick={() => openEditDialog(instructor)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          aria-label={`Hapus ${instructor.name}`}
                          onClick={() => setDeletingInstructor(instructor)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {!paginatedInstructors.length && (
                  <TableRow>
                    <TableCell
                      className="h-32 text-center text-muted-foreground"
                      colSpan={4}
                    >
                      Instruktur tidak ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Menampilkan {paginatedInstructors.length} dari{" "}
              {filteredInstructors.length} instruktur
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <Button
                    key={page}
                    type="button"
                    size="icon"
                    variant={page === currentPage ? "default" : "secondary"}
                    aria-label={`Halaman ${page}`}
                    aria-current={page === currentPage ? "page" : undefined}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                type="button"
                variant="secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <InstructorDialog
        open={isCreateOpen}
        title="Tambah Instruktur"
        description="Buat akun baru untuk PIC atau pengajar."
        form={form}
        formId="create-instructor-form"
        includePassword
        submitLabel="Simpan Instruktur"
        onChange={setForm}
        onSubmit={handleCreate}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) resetForm();
        }}
      />

      <InstructorDialog
        open={isEditOpen}
        title="Edit Instruktur"
        description="Perbarui nama, username, atau role instruktur."
        form={form}
        formId="edit-instructor-form"
        submitLabel="Simpan Perubahan"
        onChange={setForm}
        onSubmit={handleEdit}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setEditingInstructor(null);
            resetForm();
          }
        }}
      />

      <AlertDialog
        open={Boolean(deletingInstructor)}
        onOpenChange={(open) => {
          if (!open) setDeletingInstructor(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus instruktur?</AlertDialogTitle>
            <AlertDialogDescription>
              Akun {deletingInstructor?.name} akan dihapus dari daftar
              instruktur. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type InstructorDialogProps = {
  open: boolean;
  title: string;
  description: string;
  form: InstructorForm;
  formId: string;
  includePassword?: boolean;
  submitLabel: string;
  onChange: (form: InstructorForm) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onOpenChange: (open: boolean) => void;
};

function InstructorDialog({
  open,
  title,
  description,
  form,
  formId,
  includePassword = false,
  submitLabel,
  onChange,
  onSubmit,
  onOpenChange,
}: InstructorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form id={formId} className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor={`${formId}-name`}>Nama</Label>
            <Input
              id={`${formId}-name`}
              placeholder="Masukkan nama lengkap"
              value={form.name}
              onChange={(event) =>
                onChange({ ...form, name: event.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`${formId}-username`}>Username</Label>
            <Input
              id={`${formId}-username`}
              autoCapitalize="none"
              autoComplete="off"
              placeholder="Masukkan username"
              value={form.username}
              onChange={(event) =>
                onChange({ ...form, username: event.target.value })
              }
            />
          </div>
          {includePassword && (
            <div className="grid gap-2">
              <Label htmlFor={`${formId}-password`}>Password</Label>
              <Input
                id={`${formId}-password`}
                type="password"
                autoComplete="new-password"
                placeholder="Masukkan password"
                value={form.password}
                onChange={(event) =>
                  onChange({ ...form, password: event.target.value })
                }
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select
              value={form.role}
              onValueChange={(role: InstructorRole) =>
                onChange({ ...form, role })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih role instruktur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIC">PIC</SelectItem>
                <SelectItem value="PENGAJAR">Pengajar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="submit" form={formId}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Edit3,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardPageTitle } from "../_component/page-title";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
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

type Role = "ADMIN" | "PENGAJAR";

type User = {
  id: string | number;
  name: string;
  username: string;
  role: Role;
};

type UserListData = {
  results: User[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

type UserForm = {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: Role | "";
};

const pageSize = 5;

const getPaginationPages = (currentPage: number, totalPages: number) => {
  const maxVisiblePages = 5;
  const startPage = Math.max(
    1,
    Math.min(
      currentPage - Math.floor(maxVisiblePages / 2),
      totalPages - maxVisiblePages + 1
    )
  );
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );
};

const emptyForm: UserForm = {
  name: "",
  username: "",
  password: "",
  confirmPassword: "",
  role: "",
};

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userError, setUserError] = useState("");
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
  const pageNumbers = getPaginationPages(currentPage, totalPages);

  useEffect(() => {
    let isActive = true;
    const timeout = window.setTimeout(async () => {
      setIsLoadingUsers(true);
      setUserError("");

      const query = new URLSearchParams({
        limit: String(pageSize),
        page: String(currentPage),
      });

      if (search.trim()) query.set("search", search.trim());
      if (roleFilter !== "ALL") query.set("role", roleFilter);

      const response: ApiResponse<UserListData> = await fetchApi(
        `/admin/user?${query.toString()}`
      );

      if (!isActive) return;

      if (response.statusCode === 200 && response.data) {
        setUsers(response.data.results ?? []);
        setTotalUsers(response.data.total ?? 0);
      } else {
        setUsers([]);
        setTotalUsers(0);
        setUserError(response.message || "Gagal mengambil data pengguna.");
      }

      setIsLoadingUsers(false);
    }, 350);

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, [currentPage, roleFilter, search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const resetForm = () => setForm(emptyForm);

  const validateForm = (
    currentUserId?: string | number,
    options?: { requirePassword?: boolean }
  ) => {
    if (!form.name.trim() || !form.username.trim() || !form.role) {
      toast.error("Nama, username, dan role wajib diisi.");
      return false;
    }

    if (options?.requirePassword && !form.password) {
      toast.error("Password wajib diisi.");
      return false;
    }

    if (options?.requirePassword && !form.confirmPassword) {
      toast.error("Konfirmasi password wajib diisi.");
      return false;
    }

    if (
      options?.requirePassword &&
      form.password !== form.confirmPassword
    ) {
      toast.error("Password dan konfirmasi password tidak sama.");
      return false;
    }

    const usernameExists = users.some(
      (user) =>
        user.id !== currentUserId &&
        user.username.toLowerCase() === form.username.trim().toLowerCase()
    );

    if (usernameExists) {
      toast.error("Username sudah digunakan.");
      return false;
    }

    return true;
  };

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm(undefined, { requirePassword: true })) return;

    setUsers((currentUsers) => [
      {
        id: `local-${Date.now()}`,
        name: form.name.trim(),
        username: form.username.trim(),
        role: form.role as Role,
      },
      ...currentUsers,
    ]);
    setIsCreateOpen(false);
    setTotalUsers((total) => total + 1);
    resetForm();
    toast.success("Pengguna berhasil ditambahkan.");
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      username: user.username,
      password: "",
      confirmPassword: "",
      role: user.role,
    });
    setIsEditOpen(true);
  };

  const handleEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser || !validateForm(editingUser.id)) return;

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              name: form.name.trim(),
              username: form.username.trim(),
              role: form.role as Role,
            }
          : user
      )
    );
    setIsEditOpen(false);
    setEditingUser(null);
    resetForm();
    toast.success("Data pengguna berhasil diperbarui.");
  };

  const handleDelete = () => {
    if (!deletingUser) return;

    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== deletingUser.id)
    );
    setTotalUsers((total) => Math.max(0, total - 1));
    setDeletingUser(null);
    toast.success("Pengguna berhasil dihapus.");
  };

  return (
    <div className="w-full space-y-6">
      <DashboardPageTitle title="Pengguna" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Pengelolaan Pengguna
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola akun admin dan pengajar yang dapat mengakses dashboard.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Daftar Pengguna</CardTitle>
            <CardDescription className="mt-1.5">
              Total {totalUsers} pengguna terdaftar
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
                <SelectItem value="ADMIN">Admin</SelectItem>
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
                {isLoadingUsers ? (
                  <TableRow>
                    <TableCell
                      className="h-32 text-center text-muted-foreground"
                      colSpan={4}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Memuat pengguna...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
                {!isLoadingUsers && users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.username}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        {user.role === "ADMIN" ? "Admin" : "Pengajar"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          aria-label={`Edit ${user.name}`}
                          size="icon"
                          variant="outline"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          aria-label={`Hapus ${user.name}`}
                          size="icon"
                          variant="destructive"
                          onClick={() => setDeletingUser(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoadingUsers && users.length === 0 && (
                  <TableRow>
                    <TableCell
                      className="h-32 text-center text-muted-foreground"
                      colSpan={4}
                    >
                      {userError || "Pengguna tidak ditemukan."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Menampilkan {users.length} dari {totalUsers} pengguna
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={currentPage === 1 || isLoadingUsers}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Previous
              </Button>
              {pageNumbers.map((page) => (
                <Button
                  key={page}
                  type="button"
                  size="icon"
                  variant={page === currentPage ? "default" : "secondary"}
                  aria-label={`Halaman ${page}`}
                  aria-current={page === currentPage ? "page" : undefined}
                  disabled={isLoadingUsers}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                type="button"
                variant="secondary"
                disabled={currentPage === totalPages || isLoadingUsers}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna</DialogTitle>
            <DialogDescription>
              Buat akun baru untuk admin atau pengajar.
            </DialogDescription>
          </DialogHeader>
          <UserFormFields
            form={form}
            formId="create-user-form"
            includePassword
            onChange={setForm}
            onSubmit={handleCreate}
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="create-user-form">
              Simpan Pengguna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setEditingUser(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>
              Perbarui nama, username, atau role pengguna.
            </DialogDescription>
          </DialogHeader>
          <UserFormFields
            form={form}
            formId="edit-user-form"
            onChange={setForm}
            onSubmit={handleEdit}
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="edit-user-form">
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deletingUser)}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Akun {deletingUser?.name} akan dihapus dari daftar pengguna.
              Tindakan ini tidak dapat dibatalkan.
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

type UserFormFieldsProps = {
  form: UserForm;
  formId: string;
  includePassword?: boolean;
  onChange: (form: UserForm) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

function UserFormFields({
  form,
  formId,
  includePassword = false,
  onChange,
  onSubmit,
}: UserFormFieldsProps) {
  return (
    <form id={formId} className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor={`${formId}-name`}>Nama</Label>
        <Input
          id={`${formId}-name`}
          placeholder="Masukkan nama lengkap"
          value={form.name}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
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
        <>
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
          <div className="grid gap-2">
            <Label htmlFor={`${formId}-confirm-password`}>
              Konfirmasi Password
            </Label>
            <Input
              id={`${formId}-confirm-password`}
              type="password"
              autoComplete="new-password"
              placeholder="Masukkan ulang password"
              value={form.confirmPassword}
              onChange={(event) =>
                onChange({ ...form, confirmPassword: event.target.value })
              }
            />
          </div>
        </>
      )}
      <div className="grid gap-2">
        <Label>Role</Label>
        <Select
          value={form.role}
          onValueChange={(role: Role) => onChange({ ...form, role })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih role pengguna" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="PENGAJAR">Pengajar</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </form>
  );
}

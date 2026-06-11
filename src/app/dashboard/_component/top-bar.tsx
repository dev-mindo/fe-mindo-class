"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboardContext } from "@/context/DashboardContext";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { usePathname } from "next/navigation";
import {
  Edit3,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogOut,
  Menu,
  User,
  UserRoundCog,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Profile = {
  name: string;
  role: string;
  username: string;
};

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export function AppTopBar() {
  const pathname = usePathname();
  const { titleTopBar, setHideSidebar, hideSidebar } = useDashboardContext();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: "",
    role: "",
    username: "",
  });
  const [profileForm, setProfileForm] = useState<Profile>({
    name: "",
    role: "",
    username: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const changePasswordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const hideSidebarHandler = () => {
    setHideSidebar(!hideSidebar);
  };

  useEffect(() => {
    setProfile({
      name: localStorage.getItem("name") || "Profile",
      role: localStorage.getItem("role") || "-",
      username: localStorage.getItem("username") || "-",
    });
  }, []);

  const openProfileModal = () => {
    setProfileForm(profile);
    setIsEditingProfile(false);
    setIsProfileMenuOpen(false);
    window.requestAnimationFrame(() => {
      setIsProfileOpen(true);
    });
  };

  const openChangePasswordModal = () => {
    changePasswordForm.reset();
    setVisiblePasswords({
      current: false,
      new: false,
      confirm: false,
    });
    setIsProfileMenuOpen(false);
    window.requestAnimationFrame(() => {
      setIsChangePasswordOpen(true);
    });
  };

  const startEditingProfile = () => {
    setProfileForm(profile);
    setIsEditingProfile(true);
  };

  const cancelEditingProfile = () => {
    setProfileForm(profile);
    setIsEditingProfile(false);
  };

  const updateProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = profileForm.name.trim();
    const username = profileForm.username.trim();

    if (!name || !username) {
      toast.error("Nama dan username wajib diisi.");
      return;
    }

    const updatedProfile = {
      ...profile,
      name,
      username,
    };

    localStorage.setItem("name", name);
    localStorage.setItem("username", username);
    setProfile(updatedProfile);
    setProfileForm(updatedProfile);
    setIsEditingProfile(false);
    toast.success("Profil berhasil diperbarui.");
  };

  const changePassword = async (values: ChangePasswordForm) => {
    setIsChangingPassword(true);

    try {
      const response: ApiResponse = await fetchApi(
        "/admin/user/change-password",
        {
          method: "PATCH",
          body: values,
        }
      );

      if (response.statusCode !== 200) {
        toast.error(response.message || "Password gagal diperbarui.");
        return;
      }

      toast.success(response.message || "Password berhasil diperbarui.");
      setIsChangePasswordOpen(false);
      changePasswordForm.reset();
    } catch {
      toast.error("Tidak dapat terhubung ke server.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();

  const logoutHandler = async () => {
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    localStorage.removeItem("username");

    try {
      await fetch("/api/admin-set-token", { method: "DELETE" });
    } finally {
      window.location.replace("/dashboard/login");
    }
  };

  if (pathname === "/dashboard/login") {
    return null;
  }

  return (
    <>
      <div className="flex w-full items-center justify-between gap-3 bg-sidebar p-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            onClick={hideSidebarHandler}
            type="button"
            variant="ghost"
            size="icon"
          >
            <Menu />
          </Button>
          <div className="min-w-0">
            <h3 className="truncate font-medium">
              {titleTopBar || "Dashboard"}
            </h3>
          </div>
        </div>
        <DropdownMenu
          modal={false}
          open={isProfileMenuOpen}
          onOpenChange={setIsProfileMenuOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              type="button"
              className="rounded-full"
            >
              <User />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{profile.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {profile.role || profile.username}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={(event) => {
                event.preventDefault();
                openProfileModal();
              }}
            >
              <UserRoundCog />
              Profil Saya
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={(event) => {
                event.preventDefault();
                openChangePasswordModal();
              }}
            >
              <KeyRound />
              Ubah Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logoutHandler}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <LogOut />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog
        open={isProfileOpen}
        onOpenChange={(open) => {
          setIsProfileOpen(open);
          if (!open) {
            setIsEditingProfile(false);
            setProfileForm(profile);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditingProfile ? "Edit Profil" : "Profil Saya"}
            </DialogTitle>
            <DialogDescription>
              {isEditingProfile
                ? "Perbarui nama dan username akun Anda."
                : "Informasi akun yang sedang digunakan pada dashboard."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center border-b pb-5 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
              {getInitials(
                isEditingProfile ? profileForm.name : profile.name
              ) || <User className="h-8 w-8" />}
            </div>
            <h3 className="mt-3 text-lg font-semibold">
              {isEditingProfile ? profileForm.name || "Nama Profil" : profile.name}
            </h3>
            <span className="mt-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {profile.role}
            </span>
          </div>

          {isEditingProfile ? (
            <form
              id="profile-form"
              className="grid gap-4"
              onSubmit={updateProfile}
            >
              <div className="grid gap-2">
                <Label htmlFor="profile-name">Nama</Label>
                <Input
                  id="profile-name"
                  value={profileForm.name}
                  placeholder="Masukkan nama"
                  onChange={(event) =>
                    setProfileForm((currentProfile) => ({
                      ...currentProfile,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-username">Username</Label>
                <Input
                  id="profile-username"
                  autoCapitalize="none"
                  autoComplete="off"
                  value={profileForm.username}
                  placeholder="Masukkan username"
                  onChange={(event) =>
                    setProfileForm((currentProfile) => ({
                      ...currentProfile,
                      username: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-role">Role</Label>
                <Input id="profile-role" value={profile.role} disabled />
              </div>
            </form>
          ) : (
            <div className="grid gap-3">
              <ProfileItem label="Nama" value={profile.name} />
              <ProfileItem label="Username" value={profile.username} />
              <ProfileItem label="Role" value={profile.role} />
            </div>
          )}

          {isEditingProfile ? (
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={cancelEditingProfile}
              >
                Batal
              </Button>
              <Button type="submit" form="profile-form">
                Simpan Perubahan
              </Button>
            </DialogFooter>
          ) : (
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsProfileOpen(false)}
              >
                Tutup
              </Button>
              <Button type="button" onClick={startEditingProfile}>
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Profil
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isChangePasswordOpen}
        onOpenChange={(open) => {
          setIsChangePasswordOpen(open);
          if (!open) {
            changePasswordForm.reset();
            setVisiblePasswords({
              current: false,
              new: false,
              confirm: false,
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Password</DialogTitle>
            <DialogDescription>
              Gunakan password yang kuat dan berbeda dari password sebelumnya.
            </DialogDescription>
          </DialogHeader>

          <Form {...changePasswordForm}>
            <form
              id="change-password-form"
              className="grid gap-4"
              onSubmit={changePasswordForm.handleSubmit(changePassword)}
            >
              <FormField
                control={changePasswordForm.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Lama</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="pr-10"
                          type={visiblePasswords.current ? "text" : "password"}
                          autoComplete="current-password"
                          disabled={isChangingPassword}
                          placeholder="Masukkan password lama"
                        />
                        <PasswordVisibilityButton
                          visible={visiblePasswords.current}
                          label="password lama"
                          disabled={isChangingPassword}
                          onClick={() =>
                            setVisiblePasswords((currentState) => ({
                              ...currentState,
                              current: !currentState.current,
                            }))
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={changePasswordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Baru</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="pr-10"
                          type={visiblePasswords.new ? "text" : "password"}
                          autoComplete="new-password"
                          disabled={isChangingPassword}
                          placeholder="Minimal 8 karakter"
                        />
                        <PasswordVisibilityButton
                          visible={visiblePasswords.new}
                          label="password baru"
                          disabled={isChangingPassword}
                          onClick={() =>
                            setVisiblePasswords((currentState) => ({
                              ...currentState,
                              new: !currentState.new,
                            }))
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={changePasswordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Password Baru</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="pr-10"
                          type={visiblePasswords.confirm ? "text" : "password"}
                          autoComplete="new-password"
                          disabled={isChangingPassword}
                          placeholder="Masukkan ulang password baru"
                        />
                        <PasswordVisibilityButton
                          visible={visiblePasswords.confirm}
                          label="konfirmasi password"
                          disabled={isChangingPassword}
                          onClick={() =>
                            setVisiblePasswords((currentState) => ({
                              ...currentState,
                              confirm: !currentState.confirm,
                            }))
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              disabled={isChangingPassword}
              onClick={() => setIsChangePasswordOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="change-password-form"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

type ProfileItemProps = {
  label: string;
  value: string;
};

function ProfileItem({ label, value }: ProfileItemProps) {
  return (
    <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-3 rounded-lg border bg-muted/30 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-medium">{value}</span>
    </div>
  );
}

type PasswordVisibilityButtonProps = {
  visible: boolean;
  label: string;
  disabled?: boolean;
  onClick: () => void;
};

function PasswordVisibilityButton({
  visible,
  label,
  disabled,
  onClick,
}: PasswordVisibilityButtonProps) {
  return (
    <button
      type="button"
      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label={`${visible ? "Sembunyikan" : "Tampilkan"} ${label}`}
      aria-pressed={visible}
      disabled={disabled}
      onClick={onClick}
    >
      {visible ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </button>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { AlertDialogLogin } from "./loginDialog";

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [messageDialog, setMessageDialog] = useState({
    title: "",
    message: "",
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const showLoginError = (title: string, message: string) => {
    setMessageDialog({ title, message });
    setIsOpen(true);
  };

  const onFinish = async (value: LoginFormValues) => {
    setLoading(true);

    try {
      const login: ApiResponse<TUserToken> = await fetchApi("/auth/login", {
        body: value,
        method: "POST",
      });

      if (login.statusCode !== 200 || !login.data) {
        showLoginError(
          "Login Gagal",
          login.message || "Username atau password tidak valid."
        );
        return;
      }

      const tokenResponse = await fetch(
        `/api/admin-set-token?token=${encodeURIComponent(
          login.data.token
        )}&refreshToken=${encodeURIComponent(login.data.refreshToken ?? "")}`,
        { method: "POST" }
      );

      if (!tokenResponse.ok) {
        showLoginError(
          "Kesalahan Server",
          "Token login tidak dapat disimpan. Silakan coba kembali."
        );
        return;
      }

      localStorage.setItem("role", login.data.user.role);
      localStorage.setItem("name", login.data.user.name);
      localStorage.setItem("username", login.data.user.username);
      window.location.href = "/dashboard";
    } catch {
      showLoginError(
        "Kesalahan Server",
        "Tidak dapat terhubung ke server. Silakan coba kembali."
      );
    } finally {
      setLoading(false);
    }
  };

  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_38%),radial-gradient(circle_at_bottom_right,hsl(var(--primary)/0.1),transparent_35%)]" />

      <Button
        type="button"
        size="icon"
        variant="outline"
        className="absolute right-4 top-4 z-10 rounded-full bg-background/80 backdrop-blur"
        aria-label={
          mounted && isDark ? "Gunakan tema terang" : "Gunakan tema gelap"
        }
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {mounted ? (
          isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )
        ) : (
          <span className="h-4 w-4" />
        )}
      </Button>

      <Card className="relative z-10 w-full max-w-md border-border/70 shadow-xl">
        <CardHeader className="items-center pb-5 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Image
              height={48}
              width={48}
              src="/logo/mindo-logo.svg"
              alt="Logo Mindo"
              priority
            />
          </div>
          <CardTitle className="text-2xl">Selamat Datang</CardTitle>
          <CardDescription className="max-w-xs">
            Masuk menggunakan akun administrator untuk mengelola classroom.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              className="space-y-5"
              onSubmit={form.handleSubmit(onFinish)}
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field}
                          className="h-11 pl-9"
                          autoCapitalize="none"
                          autoComplete="username"
                          disabled={loading}
                          placeholder="Masukkan username"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field}
                          className="h-11 px-9"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          disabled={loading}
                          placeholder="Masukkan password"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          aria-label={
                            showPassword
                              ? "Sembunyikan password"
                              : "Tampilkan password"
                          }
                          onClick={() => setShowPassword((visible) => !visible)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className="h-11 w-full" disabled={loading} type="submit">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk ke Dashboard"
                )}
              </Button>
            </form>
          </Form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Mindo Classroom Administration
          </p>
        </CardContent>
      </Card>

      <AlertDialogLogin
        isOpen={isOpen}
        message={messageDialog.message}
        setIsOpen={setIsOpen}
        title={messageDialog.title}
      />
    </div>
  );
};

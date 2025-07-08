"use client";
import ICard from "@/components/base/ICard";
import IInput from "@/components/base/IInput";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { Loader2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { AlertDialogLogin } from "./loginDialog";
import { useState } from "react";

export const Login = () => {
  const { setTheme, theme } = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [messageDialog, setMessageDialog] = useState<{
    title: string;
    message: string;
  }>({
    title: "",
    message: "",
  });

  type LoginFormValues = {
    username: string;
    password: string;
  };

  const form = useForm<LoginFormValues>();

  const onFinish: (value: LoginFormValues) => Promise<void> = async (value) => {
    setLoading(true);
    const login: ApiResponse<TUserToken> = await fetchApi("/auth/login", {
      body: value,
      method: "POST",
    });

    if (login) {
      if (login.statusCode === 200) {
        const token = await fetch(
          `/api/admin-set-token?token=${login.data?.token}&refreshToken=${login.data?.refreshToken}`,
          {
            method: "POST",
          }
        );

        if (token) {
          if (login.data) {
            localStorage.setItem("role", login.data?.user.role);
            localStorage.setItem("name", login.data?.user.name);
            localStorage.setItem("username", login.data?.user.username);
            window.location.href = "/dashboard";
          } else {
            setIsOpen(true);
            setMessageDialog({
              message: "",
              title: "Kesalahan Server",
            });
            setLoading(false)
          }
        }
      }

      if (login.statusCode === 401) {
        setIsOpen(true);
        setMessageDialog({
          message: "Username atau Password salah",
          title: "Login Gagal",
        });
        setLoading(false)
      }
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <ICard className="w-[20%]">
        <div className="flex justify-end">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              theme === "system" || theme === "light"
                ? setTheme("dark")
                : setTheme("light");
            }}
          >
            {theme === "system" || theme === "light" ? <Moon /> : <Sun />}
          </Button>
        </div>
        <Image
          className="mx-auto mb-[20px]"
          height={300}
          width={90}
          src="/logo/mindo-logo.svg"
          alt="logo mindo"
        ></Image>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFinish)}>
            <div className="flex flex-col gap-4">
              <div>
                <div>Username</div>
                <div>
                  <IInput
                    control={form.control}
                    name="username"
                    placeholder="Admin"
                  />
                </div>
              </div>
              <div>
                <div>Password</div>
                <div>
                  <IInput
                    control={form.control}
                    name="password"
                    placeholder="Password"
                    type="password"
                  />
                </div>
              </div>
              <div>
                <Button className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" /> Please wait
                    </>
                  ) : (
                    "Login"
                  )}{" "}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </ICard>
      <AlertDialogLogin
        isOpen={isOpen}
        message={messageDialog.message}
        setIsOpen={setIsOpen}
        title={messageDialog.title}
      />
    </div>
  );
};

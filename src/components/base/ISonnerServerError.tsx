"use client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { redirect } from "next/dist/server/api-utils";
export function ISonnerServerError() {
  useEffect(() => {
    setTimeout(() => {
        toast.error("Internal Server Error");
    }, 3000)
    window.location.href = process.env.NEXT_PUBLIC_MINDO_MY_CLASS
  }, []);

  return <></>;
}

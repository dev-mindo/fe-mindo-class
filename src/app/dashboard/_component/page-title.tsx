"use client";

import { useDashboardContext } from "@/context/DashboardContext";
import { useEffect } from "react";

type Props = {
  title: string;
};

export function DashboardPageTitle({ title }: Props) {
  const { setTitleTopBar } = useDashboardContext();

  useEffect(() => {
    setTitleTopBar(title);
  }, [setTitleTopBar, title]);

  return null;
}

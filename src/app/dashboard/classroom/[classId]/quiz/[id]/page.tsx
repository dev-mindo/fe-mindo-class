"use client";
import { DashboardPageTitle } from "@/app/dashboard/_component/page-title";
import { ManageQuiz } from "@/app/dashboard/quiz/[id]/_component/ManageQuiz";
import { useDashboardContext } from "@/context/DashboardContext";
import { useEffect } from "react";

const Page = () => {
  const { setHideSidebar } = useDashboardContext();
  useEffect(() => {
    setHideSidebar(true);

    return () => {
      setHideSidebar(false);
    };
  }, [setHideSidebar]);

  return (
    <>
      <DashboardPageTitle title="Detail Kuis" />
      <ManageQuiz />
    </>
  );
};

export default Page;

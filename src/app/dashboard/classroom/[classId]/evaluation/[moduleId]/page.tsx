"use client";

import { DashboardPageTitle } from "@/app/dashboard/_component/page-title";
import { useDashboardContext } from "@/context/DashboardContext";
import { useEffect } from "react";
import { ManageEvaluation } from "./_component/ManageEvaluation";

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
      <DashboardPageTitle title="Edit Evaluasi" />
      <ManageEvaluation />
    </>
  );
};

export default Page;

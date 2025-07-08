"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { PrevNextModule } from "../pagination";

type Props = {
  baseUrl: string;
  dataSection: TNavClass["sectionMenu"] | null;
  getPrevNextModule: (
    dataSection: TNavClass["sectionMenu"]
  ) => PrevNextModule[];
  currentPage: TCurrentPageNav;
};

export const HandleBackPage = (props: Props) => {
  const router = useRouter();
  const handleBackPage = () => {
    if (!props.dataSection) {
      // Optionally handle the null case, e.g., return early or show an error
      return;
    }

    const getNextStep = props.getPrevNextModule(
      props.dataSection
    );
    router.push(
      `${props.baseUrl}/${getNextStep[0].slug}/${getNextStep[0].previous[0].slug}`
    );
  };

  return (
    <>
    <Button onClick={handleBackPage} disabled={props.currentPage?.step === 1}>
      <ChevronLeft />
      Kembali
    </Button>
    </>
  );
};

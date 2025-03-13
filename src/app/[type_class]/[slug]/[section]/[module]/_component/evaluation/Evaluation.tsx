"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { useRouter } from "next/navigation";

type Props = {
  title: string;
  description: string;
  evaluation: TModuleMaterial["evaluation"];
  baseUrl: string
};

const Evaluation = ({ title, description, evaluation, baseUrl }: Props) => {
    const router = useRouter()
  const [feedbackDone, setFeedbackDone] = useState(!!evaluation?.feedbackUser && evaluation?.feedbackUser.length > 0 || false);

  const handleStartFeedback = async () => {
    // alert("Mulai mengisi feedback...");
    // setFeedbackDone(true);
    const createEvaluation: ApiResponse = await fetchApi(`/evaluation/${evaluation?.id}/feedback/attempt`, {
        method: 'POST',
        body: {}
    })
    if(createEvaluation && createEvaluation.success){
        router.push(`${baseUrl}/feedback-form/${evaluation?.id}`)
    }
  };  

  return (
    <div className="max-w-[90%] mx-auto p-6 bg-card rounded-lg">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>

      {/* Kata-kata untuk pengguna */}
      <p className="text-gray-600 dark:text-gray-300 mt-2">{description}</p>

      {/* Status Feedback */}
      <div className="mt-4">
        Status Pengisian :
        <Badge
          className="ml-2"
          variant={feedbackDone ? "default" : "destructive"}
        >
          {feedbackDone ? "Sudah Mengisi" : "Belum Mengisi"}
        </Badge>
      </div>

      {/* Tombol Aksi */}

      <Button
        onClick={handleStartFeedback}
        disabled={feedbackDone}
        className="mt-4 w-full"
      >
        Mulai Feedback
      </Button>
    </div>
  );
};

export default Evaluation;

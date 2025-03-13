'use client'
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge"

type Props = {
    title: string
    description: string
}


const Evaluation = ({title, description}: Props) => {
  const [feedbackDone, setFeedbackDone] = useState(false);

  const handleStartFeedback = () => {
    alert("Mulai mengisi feedback...");
    setFeedbackDone(true);
  };

  return (
    <div className="max-w-[90%] mx-auto p-6 bg-card rounded-lg">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>

      {/* Kata-kata untuk pengguna */}
      <p className="text-gray-600 dark:text-gray-300 mt-2">
        {description}
      </p>

      {/* Status Feedback */}
      <div className="mt-4">
        Status Pengisian :  
        <Badge
            className="ml-2"
            variant={feedbackDone ? 'default' : 'destructive'}
        >{feedbackDone ? "Sudah Mengisi" : "Belum Mengisi"}</Badge>        
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

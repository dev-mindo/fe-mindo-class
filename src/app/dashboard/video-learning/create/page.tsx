"use client";

import CreateVideoLearning from "../../_component/createVideoLearning";
import { useState } from "react";
import ManageQuiz from "@/components/quiz/manageQuiz";

const Page = () => {
  const [productId, setProductId] = useState("");

  return (
    <div className="w-full">
      <h1>Create Video Learning</h1>
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="col-span-2">
          {/* <CreateVideoLearning setProductId={setProductId} /> */}
        </div>
        <ManageQuiz productId={productId} title="Pretest Quiz" />
        <ManageQuiz productId={productId} title="Posttest Quiz" />
      </div>
    </div>
  );
};

export default Page;

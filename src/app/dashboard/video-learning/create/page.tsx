"use client";

import CreateVideoLearning from "../../_component/createVideoLearning";
import { useState } from "react";
import ManageQuiz from "@/components/quiz/manageQuiz";
import { DashboardPageTitle } from "../../_component/page-title";

const Page = () => {
  const [productId, setProductId] = useState("");

  return (
    <div className="w-full">
      <DashboardPageTitle title="Create Video Learning" />
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

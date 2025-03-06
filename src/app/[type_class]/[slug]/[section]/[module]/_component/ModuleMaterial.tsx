"use client";
import QuillEditor from "@/components/base/EditorQuill";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/utils/fetchApi";
import parse from "html-react-parser";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  materialData: TModuleMaterial | undefined;
};

export const ModuleMaterial = ({ materialData }: Props) => {  
  return (
    <div>
      {materialData?.description && (
        <div className="p-4 bg-card h-[100%] rounded-lg mt-4">
          {parse(materialData?.description || "")}
        </div>
      )}      
      <div className="w-full mt-4">
        {materialData?.file !== "" && (
          <Button asChild className="w-full">
            <Link href={materialData?.file || ""} target="_blank">
              Akses Materi
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

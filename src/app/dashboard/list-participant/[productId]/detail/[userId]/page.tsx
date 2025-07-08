"use client";

import ICard from "@/components/base/ICard";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { Accordion } from "@radix-ui/react-accordion";
import moment from "moment";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const [dataDetailParticipant, setDataDetailParticipant] =
    useState<TDetailParticipant | null>(null);
  const params = useParams();

  const detailParticipant = async () => {
    const getDetailParticipant: ApiResponse<TDetailParticipant> =
      await fetchApi(
        `/admin/classroom/show-detail-participant/${params.productId}/${params.userId}`
      );

    if (getDetailParticipant && getDetailParticipant.data) {
      setDataDetailParticipant(getDetailParticipant.data);
    }

    console.log("get detail participant", getDetailParticipant);
  };

  useEffect(() => {
    detailParticipant();
  }, []);

  return (
    <div className="w-full">
      <div className="mb-[20px]">
        <h1 className="text-xl">Detail Peserta</h1>
      </div>
      <div className="flex flex-col gap-5">
        <ICard className="w-full">
          <div className="grid grid-cols-2 w-[30%] gap-3">
            <div>Tipe Kelas</div>
            <div>: {dataDetailParticipant?.classType}</div>
            <div>Kelas</div>
            <div>: {dataDetailParticipant?.className}</div>
            <div>Nama Peserta</div>
            <div>: {dataDetailParticipant?.name}</div>
            <div>Progress</div>
            <div>: {dataDetailParticipant?.progress}</div>
            <div>Total Score</div>
            <div>: {dataDetailParticipant?.totalScore}</div>
            <div>Sudah Mendapatkan Sertifikat</div>
            <div>
              : {dataDetailParticipant?.isCertificateEligible ? "Sudah" : "Belum"}
            </div>
            <div>Mendapat Sertifikat</div>
            <div className="flex">
              <p className="mr-1">:</p> <Switch></Switch>
            </div>
          </div>
        </ICard>
        {dataDetailParticipant?.sections.map((sectionItem) => (
          <ICard>
            <h1 className="text-lg">{sectionItem.sectionTitle}</h1>
            <div className="my-[10px] mx-3">
              {sectionItem.modules?.map((moduleItem, key) => (
                <Accordion type="single" collapsible>
                  <AccordionItem value={`item-${key}`}>
                    <AccordionTrigger>
                      {moduleItem.moduleTitle}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-4">
                        {moduleItem.moduleType === "QUIZ" &&
                          moduleItem.quizAttempts.length > 0 && (
                            <div>
                              <Table className="w-full">
                                {/* <TableCaption>List Kelas</TableCaption> */}
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Mulai</TableHead>
                                    <TableHead>Selesai</TableHead>
                                    <TableHead>Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {moduleItem.quizAttempts.map(
                                    (sectionItem) => (
                                      <TableRow key={sectionItem.attemptId}>
                                        <TableCell>
                                          {sectionItem.score}
                                        </TableCell>
                                        <TableCell>
                                          {moment(sectionItem.startedAt).format(
                                            "LLLL"
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          {moment(
                                            sectionItem.completeAt
                                          ).format("LLLL")}
                                        </TableCell>
                                        <TableCell>
                                          {sectionItem.status}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        {moduleItem.moduleType === "TASK" &&
                          moduleItem.tasks.length > 0 && (
                            <>
                              <div className="grid grid-cols-3 gap-3 text-sm">
                                <div>Upload URL</div>
                                <div className="col-span-2">
                                  :{" "}
                                  <a
                                    href={moduleItem.tasks.at(0)?.uploadUrl}
                                    target="_blank"
                                  >
                                    {moduleItem.tasks.at(0)?.uploadUrl}
                                  </a>
                                </div>
                                <div>Grade</div>
                                <div className="col-span-2 w-[20%] flex gap-2">
                                  <div className="flex">
                                    <p className="mr-1">: </p>
                                    <Input
                                      type="number"
                                      defaultValue={
                                        moduleItem.tasks.at(0)?.grade
                                      }
                                    />{" "}
                                  </div>
                                  <Button>Save</Button>
                                </div>
                                <div>Status</div>
                                <div className="col-span-2">
                                  : {moduleItem.tasks.at(0)?.status}
                                </div>
                                <div>Dikumpulkan Pada</div>
                                <div className="col-span-2">
                                  :{" "}
                                  {moment(
                                    moduleItem.tasks.at(0)?.createdAt
                                  ).format("LLLL")}
                                </div>
                                <div>Diperbaharui Pada</div>
                                <div className="col-span-2">
                                  :{" "}
                                  {moment(
                                    moduleItem.tasks.at(0)?.updatedAt
                                  ).format("LLLL")}
                                </div>
                              </div>
                            </>
                          )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          </ICard>
        ))}
      </div>
    </div>
  );
};

export default Page;

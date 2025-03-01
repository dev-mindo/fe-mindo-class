"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { useEffect, useState } from "react";
import { TQuizData } from "../page";

type Props = {
  quizData: TQuizData | undefined;
  question: TQuizData["question"] | undefined;
  eventType: string;
  onDataFromQuestion?: (data: { questionId: number; answerId: number }) => void;
  onSelectedPagination?: (page: number | undefined) => void;
};

export const Question = ({
  onSelectedPagination,
  onDataFromQuestion,
  question,
  quizData,
}: Props) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");

  // Sinkronisasi state jika question berubah
  useEffect(() => {
    if (question?.userAnswer?.[0]?.answerId) {
      const getDataAnswer = question.userAnswer[0].answerId
      setSelectedAnswer(getDataAnswer.toString());
      onDataFromQuestion?.({
        questionId: question.id,
        answerId: getDataAnswer
      })
    } else {
      setSelectedAnswer(""); // Reset jika tidak ada jawaban
    }
  }, [question]);

  return (
    <div className="grid grid-cols-4">
      <div className="flex col-span-3 justify-center item-center gap-4">
        {question?.image && (
          <div className="mr-5">
            <Image width={200} height={200} src={question?.image} alt="" />
          </div>
        )}
        <div>
          <div className="mt-5 text-3xl">
            <h1>{question?.questionText}</h1>
          </div>
          <div className="mt-5">
            <div className="flex flex-col">
              <RadioGroup
                value={selectedAnswer}
                onValueChange={(e) => {
                  setSelectedAnswer(e);
                  onDataFromQuestion?.({
                    questionId: question?.id || 0,
                    answerId: parseInt(e),
                  });
                }}
              >
                {question?.Answer.map((it, index) => (
                  <div key={it.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={it.id.toString()} id={"r" + index} />
                    <Label className="text-2xl my-4 w-full" htmlFor={"r" + index}>
                      <div className="cursor-pointer">{it.answerText}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>
      {/* pagination */}
      <div className="justify-self-end">
        <div className="grid grid-cols-4 gap-2 bg-card p-4 rounded-xl max-w-fit">
          {quizData?.pagination.page.map(
            (item: TQuizData["pagination"]["page"][number]) => (
              <Button
                key={item.number}
                onClick={() => onSelectedPagination?.(item.number)}
                className={`m-0 bg-[#2E2E2E] border 
                  ${
                    item.current
                      ? "bg-[#3A5C9B] border border-[#4B6FBF] hover:bg-[#2D4C7C] hover:border-[#3A5C9B]"
                      : item.completed
                      ? "bg-[#1E824C] border border-[#27AE60] hover:bg-[#2D4C7C] hover:border-[#3A5C9B]"
                      : "bg-primary border-[#2D4C7C] hover:bg-[#2D4C7C] hover:border-[#3A5C9B]"
                  } }`}
              >
                {item.number}
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

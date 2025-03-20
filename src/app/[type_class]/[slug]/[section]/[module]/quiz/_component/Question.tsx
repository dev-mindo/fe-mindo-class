"use client";

import { useAppContext } from "@/app/[type_class]/_component/navProvider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ChevronLeft,
  ChevronRight,
  SquareCheckBig,
  SquareX,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  quizData: TQuizData | undefined;
  question: TQuizData["question"] | undefined;
  eventType: string;
  onDataFromQuestion?: (data: { questionId: number; answerId: number }) => void;
  onSelectedPagination?: (page: number | undefined) => void;
  options: {
    redirectPagination: string;
    redirectCompleted: string;
    pathType: string;
  };
};

type TUserAnswer = {
  answerId: number;
  isCorrect: boolean;
};

export const Question = ({
  onSelectedPagination,
  onDataFromQuestion,
  question,
  quizData,
  options,
}: Props) => {
  const { theme } = useTheme();
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [selectedUserAnswer, setSelectedUserAnswer] = useState<TUserAnswer>({
    answerId: 0,
    isCorrect: false,
  });
  const { hidePagination, setHidePagination } = useAppContext();

  useEffect(() => {
    const getUserAnswer = question?.userAnswer.at(0) as {
      answerId: number;
      answer: {
        isCorrect: boolean;
      };
    };
    if (getUserAnswer) {
      setSelectedUserAnswer({
        answerId: getUserAnswer.answerId,
        isCorrect: getUserAnswer.answer && getUserAnswer.answer.isCorrect,
      });
    }
  }, [question]);

  function stylePagination(item: { current: boolean; completed: boolean }) {
    if (options.pathType === "quiz") {
      return item.current
        ? "bg-[#3A5C9B] border border-[#4B6FBF] hover:bg-[#2D4C7C] hover:border-[#3A5C9B]"
        : item.completed
        ? "bg-[#1E824C] border border-[#27AE60] hover:bg-[#2D4C7C] hover:border-[#3A5C9B]"
        : "bg-primary border-[#2D4C7C] hover:bg-[#2D4C7C] hover:border-[#3A5C9B]";
    }

    if (options.pathType === "evaluation") {
      return item.current
        ? "bg-[#616161] border border-[#BDBDBD] hover:bg-[#90A4AE] hover:border-[#BDBDBD]"
        : "bg-[#424242] border-[#757575] hover:bg-[#90A4AE] hover:border-[#BDBDBD]";
    }

    return "";
  }

  // function styleAnswer() {}

  // Sinkronisasi state jika question berubah
  useEffect(() => {
    if (question?.userAnswer?.[0]?.answerId) {
      const getDataAnswer = question.userAnswer[0].answerId;
      setSelectedAnswer(getDataAnswer.toString());
      onDataFromQuestion?.({
        questionId: question.id,
        answerId: getDataAnswer,
      });
    } else {
      setSelectedAnswer(""); // Reset jika tidak ada jawaban
    }
  }, [question]);

  return (
    <div className="">
      <div className="grid grid-cols-4 w-[90%] mx-auto lg:w-[100%]">
        <div className="flex col-span-4 lg:col-span-3 justify-center item-center gap-4">
          {question?.image && (
            <div className="mr-5">
              <Image width={200} height={200} src={question?.image} alt="" />
            </div>
          )}
          <div>
            <div className="mt-5 text-xl md:text-2xl lg:text-3xl">
              <h1>{question?.questionText}</h1>
            </div>
            <div className="mt-5">
              <div className="flex flex-col">
                {options.pathType === "evaluation" && (
                  <div>
                    {question?.Answer.map((it) => (
                      <div key={it.id}>
                        {selectedUserAnswer.answerId !== 0 &&
                        selectedUserAnswer.answerId === it.id ? (
                          <div
                            className={`my-4 rounded-xl p-4 bg-[#616161] border-2 ${
                              selectedUserAnswer.isCorrect
                                ? "border-green-500"
                                : "border-red-500"
                            }`}
                          >
                            <div className="flex justify-between items-center text-md sm:text-lg lg:text-2xl">
                              <div>{it.answerText}</div>
                              <div>
                                {selectedUserAnswer.isCorrect ? (
                                  <SquareCheckBig className="text-green-500" />
                                ) : (
                                  <SquareX className="text-red-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`my-4 rounded-xl p-4
                            bg-[#424242] border border-[#757575]
                          `}
                          >
                            <div className="flex justify-between">
                              <div className="text-md sm:text-lg lg:text-2xl">{it.answerText}</div>
                              <div className="w-md"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {options.pathType === "quiz" && (
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
                      <div
                        key={it.id}
                        className={`flex items-center space-x-2 my-1 rounded-xl 
                              ${
                                selectedAnswer === it.id.toString()
                                  ? `border-primary bg-[#e0e0e0] border-2 dark:bg-[#616161] border-4`
                                  : `border border-[#757575] bg-[#f5f5f5] hover:bg-[#e0e0e0] dark:bg-[#424242] dark:hover:bg-[#616161]`
                              }`}
                      >
                        <RadioGroupItem
                          className="ml-4"
                          value={it.id.toString()}
                          id={"r" + index}
                        />
                        <Label
                          className="py-4 pl-1 pr-4 text-md sm:text-lg lg:text-2xl w-full"
                          htmlFor={"r" + index}
                        >
                          <div className="cursor-pointer">{it.answerText}</div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* pagination */}
        <div className="justify-self-end w-full">
          <div className="flex lg:pl-5 xl:pl-10 justify-center static">
            <div className="flex fixed right-0 lg:right-auto top-0 lg:top-auto">
              <Button
                onClick={() => {
                  hidePagination
                    ? setHidePagination(false)
                    : setHidePagination(true);
                }}
                size="icon"
                className="mt-4 lg:hidden"
              >
                {hidePagination ? <ChevronLeft /> : <ChevronRight />}
              </Button>
              <div className={`${hidePagination ? "hidden" : "block"}`}>
                <div className="grid grid-cols-4 gap-2 bg-card p-4 rounded-xl max-w-fit">
                  {quizData?.pagination.page.map(
                    (item: TQuizData["pagination"]["page"][number]) => (
                      <Button
                        key={item.number}
                        onClick={() => onSelectedPagination?.(item.number)}
                        className={`relative m-0 bg-[#2E2E2E] border 
                  ${stylePagination(item)} }`}
                      >
                        {options.pathType === "evaluation" ? (
                          item.isCorrect ? (
                            <SquareCheckBig className="absolute top-0 right-0 text-green-500" />
                          ) : (
                            <SquareX className="absolute top-0 right-0 text-red-500" />
                          )
                        ) : (
                          <></>
                        )}
                        {item.number}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

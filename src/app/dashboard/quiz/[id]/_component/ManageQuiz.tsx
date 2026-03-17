"use client";
import ICard from "@/components/base/ICard";
import { IInput } from "@/components/base/IInput";
import IRadio from "@/components/base/IRadio";
import { ITextArea } from "@/components/base/ITextArea";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toaster } from "@/components/ui/sonner";
import updateAnswerFormSchema, {
  ModuleFormUpdateAnswer,
} from "@/entities/schema/answer.schema";
import questionSchema, {
  QuestionFormSchema,
} from "@/entities/schema/question.schema";
import quizSchema, { QuizFormSchema } from "@/entities/schema/quiz.schema";
import { removePrefix } from "@/lib/utils";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { SquarePen, Trash2 } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { DestroyQuestionDialog } from "./DestroyQuestionDialog";

export const ManageQuiz = () => {
  const params = useParams<{
    id: string;
  }>();

  const [editQuestion, setEditQuestion] = useState<number>(0);

  const [editAnswer, setEditAnswer] = useState<number>(0);

  const [addQuestion, setAddQuestion] = useState<boolean>(false);

  const [showDestroyQuestionDialog, setShowQuestionDialog] =
    useState<boolean>(false);

  const [destroyQuestionData, setDestroyQuestionData] = useState<{
    id: number;
    questionText: string;
  }>({
    id: 0,
    questionText: "",
  });

  const [dataQuizDetail, setDataQuizDetail] =
    useState<TDataQuizDetail | null>();

  const quizForm = useForm<QuizFormSchema>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      minimunScore: 0,
      hour: 0,
      minute: 0,
      limitTrial: 0,
    },
  });

  const questionForm = useForm<QuestionFormSchema>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: "",
    },
  });

  const answerForm = useForm<ModuleFormUpdateAnswer>({
    resolver: zodResolver(updateAnswerFormSchema),
    defaultValues: {
      answers: [
        {
          id: "",
          answerText: "",
          isCorrect: false,
        },
      ],
    },
  });

  const {
    formState: { errors: answerErrors },
  } = answerForm;

  const { fields, append, remove } = useFieldArray({
    control: answerForm.control,
    name: "answers",
  });

  const fetchDetailQuiz = async () => {
    const getDetailQuiz: ApiResponse<TDataQuizDetail> = await fetchApi(
      `/admin/quiz/show-detail/${params.id}`
    );

    if (getDetailQuiz) {
      if (getDetailQuiz.statusCode === 200 && getDetailQuiz.data) {
        const detailQuiz = getDetailQuiz.data;
        setDataQuizDetail(getDetailQuiz.data);
        quizForm.setValue("title", detailQuiz.title);
        quizForm.setValue("minimunScore", detailQuiz.minimumScore);
        quizForm.setValue(
          "hour",
          Number(detailQuiz.limitTime.split(":").at(0))
        );
        quizForm.setValue(
          "minute",
          Number(detailQuiz.limitTime.split(":").at(1))
        );
        quizForm.setValue("limitTrial", detailQuiz.limitTrial);
      } else {
        setDataQuizDetail(null);
      }
    }
  };

  const handleReset = () => {
    fetchDetailQuiz();
    setAddQuestion(false);
    setEditAnswer(0);
    setEditQuestion(0);
  };

  const handleUpdateQuiz = async (value: any) => {
    console.log(value);
    const updateQuiz: ApiResponse = await fetchApi(
      `/admin/quiz/update-quiz/${params.id}`,
      {
        body: value,
        method: "PUT",
      }
    );

    if (updateQuiz) {
      if (updateQuiz.statusCode === 200) {
        toast.info("Quiz berhasil di perbaharui");
        handleReset();
      } else {
        toast.error(updateQuiz.message);
      }
    } else {
      toast.error("Error tidak ditemukan");
    }
  };

  const handleUpdateQuestion = async (value: any) => {
    const updateQuestion: ApiResponse = await fetchApi(
      `/admin/quiz/question/${editQuestion}`,
      {
        body: value,
        method: "PUT",
      }
    );

    if (updateQuestion) {
      if (updateQuestion.statusCode === 200) {
        toast.info("Pertanyaan berhasil di perbaharui");
        handleReset();
      } else {
        toast.error(updateQuestion.message);
      }
    } else {
      toast.error("Error tidak ditemukan");
    }
  };

  const handleUpdateAnswer = async (value: any) => {
    console.log(value);

    const updateAnswer: ApiResponse = await fetchApi(
      `/admin/quiz/question/${editAnswer}/answer`,
      {
        body: value,
        method: "PUT",
      }
    );

    if (updateAnswer) {
      if (updateAnswer.statusCode === 200) {
        toast.info("Jawaban berhasil di perbaharui");
        handleReset();
      } else {
        toast.error(updateAnswer.message);
      }
    } else {
      toast.error("Error tidak ditemukan");
    }
  };

  useEffect(() => {
    fetchDetailQuiz();
  }, []);

  useEffect(() => {}, [dataQuizDetail]);

  useEffect(() => {
    console.log(answerErrors.answers);
    if (answerErrors.answers && "root" in answerErrors.answers) {
      const getErrorAnswer: any = answerErrors.answers.root;
      if (getErrorAnswer && "message" in getErrorAnswer) {
        toast.error(getErrorAnswer.message);
      }
    }
  }, [answerErrors]);

  const handleCreateQuestion = async (value: any) => {
    console.log(value);
    const createQuestion: ApiResponse = await fetchApi(
      `/admin/quiz/question/${dataQuizDetail?.id}`,
      {
        method: "POST",
        body: value,
      }
    );

    if (createQuestion) {
      if (createQuestion.statusCode === 200) {
        toast.info("Berhasil menambahkan pertanyaan");
        handleReset();
      } else {
        toast.error(createQuestion.message);
      }
    } else {
      toast.error("Error tidak ditemukan");
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 flex flex-col gap-4">
          <ICard>
            <div className="mb-5">
              <h1>Konfigurasi Kuis</h1>
            </div>
            <Form {...quizForm}>
              <form onSubmit={quizForm.handleSubmit(handleUpdateQuiz)}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-3">
                    <Label>Nama Kelas</Label>
                    <Input
                      disabled={true}
                      value={dataQuizDetail?.module.section.classProduct.title}
                    ></Input>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label>Nama Bagian</Label>
                    <Input
                      disabled={true}
                      value={dataQuizDetail?.module.section.title}
                    ></Input>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label>Nama Modul</Label>
                    <Input
                      disabled={true}
                      value={dataQuizDetail?.module.title}
                    ></Input>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label>Judul Kuis</Label>
                    <IInput name="title" control={quizForm.control} />
                  </div>
                  <div className="">
                    <Label>Skor Minimal</Label>
                    <IInput
                      name="minimunScore"
                      control={quizForm.control}
                      placeholder="70"
                      type="number"
                    />
                  </div>
                  <div className="">
                    <Label>Batas Waktu</Label>
                    <div className="flex gap-2 items-center">
                      <IInput
                        name="hour"
                        control={quizForm.control}
                        placeholder="Jam"
                        type="number"
                      />
                      <p>:</p>
                      <IInput
                        name="minute"
                        control={quizForm.control}
                        placeholder="Menit"
                        type="number"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Percobaan</Label>
                    <IInput
                      name="limitTrial"
                      control={quizForm.control}
                      placeholder="3"
                      type="number"
                    />
                  </div>
                  <div></div>
                  <div className="mt-4 col-span-2">
                    <Button type="submit" className="w-full">
                      Simpan Konfigurasi
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </ICard>
          <ICard>
            <h1>List Soal</h1>
          </ICard>
          {dataQuizDetail?.question.map((questionItem) => (
            <ICard className="border border-2">
              <div className="flex justify-between mb-2 gap-2">
                <h1>{questionItem.questionText}</h1>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      setDestroyQuestionData({
                        id: questionItem.id,
                        questionText: questionItem.questionText
                      });
                      setShowQuestionDialog(true);
                    }}
                    type="button"
                    variant={"destructive"}
                    size="icon"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </ICard>
          ))}
        </div>
        <div className="col-span-2 flex flex-col gap-4">
          <ICard>
            <h1>List Pertanyaan</h1>
          </ICard>
          {dataQuizDetail?.question.map((questionItem) => (
            <ICard>
              <div className="flex gap-2">
                <Form {...questionForm}>
                  <form
                    onSubmit={questionForm.handleSubmit(handleUpdateQuestion)}
                  >
                    <div className="flex gap-2">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                          <Image
                            alt=""
                            src={"/image/empty_image.png"}
                            width={400}
                            height={400}
                          ></Image>
                          {editQuestion === questionItem.id && (
                            <div className="flex gap-2 items-center">
                              {/* <IInput
                                // name="image"
                                // control={questionForm.control}
                                type="file"
                              />
                              <div className="mt-2">
                                <Button variant={"destructive"} size="icon">
                                  <Trash2 />
                                </Button>
                              </div> */}
                            </div>
                          )}
                        </div>
                        <div className="col-span-2 flex flex-col gap-4">
                          <Label>Pertanyaan</Label>
                          {editQuestion === questionItem.id ? (
                            <ITextArea
                              defaultValue={questionItem.questionText}
                              name="questionText"
                              control={questionForm.control}
                              rows={7}
                              placeholder="Masukkan Pertanyaan"
                            />
                          ) : (
                            <h1>{questionItem.questionText}</h1>
                          )}
                        </div>
                      </div>
                      <div>
                        {editQuestion === questionItem.id && (
                          // Hanya tombol ini yang submit form
                          <Button type="submit">Simpan</Button>
                        )}
                      </div>
                    </div>
                  </form>
                </Form>
                {editQuestion !== questionItem.id && (
                  <Button
                    type="button"
                    className="bg-yellow-500"
                    onClick={() => {
                      questionForm.setValue(
                        "questionText",
                        questionItem.questionText
                      );
                      setEditQuestion(questionItem.id);
                      setAddQuestion(false);
                      setEditAnswer(0);
                    }}
                  >
                    <SquarePen />
                  </Button>
                )}
              </div>
              <Form {...answerForm}>
                <form onSubmit={answerForm.handleSubmit(handleUpdateAnswer)}>
                  <div className="flex flex-col mt-4">
                    <div className="flex justify-between items-center">
                      <Label className="mb-2">Jawaban</Label>
                      <div className="flex gap-2">
                        <Button
                          className={
                            editAnswer === questionItem.id ? "" : "hidden"
                          }
                          type="submit"
                        >
                          Simpan
                        </Button>
                        {editAnswer === questionItem.id ? (
                          <>
                            <Button
                              onClick={() => {
                                setEditAnswer(0);
                              }}
                              type="button"
                              variant={"secondary"}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              className="bg-yellow-500"
                              onClick={() => {
                                setEditAnswer(questionItem.id);
                                setAddQuestion(false);
                                setEditQuestion(0);
                                answerForm.setValue(
                                  "answers",
                                  questionItem.Answer.map((answerItem) => ({
                                    id: answerItem.id.toString(),
                                    answerText: answerItem.answerText,
                                    isCorrect: answerItem.isCorrect,
                                  }))
                                );
                              }}
                            >
                              <SquarePen />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {editAnswer === questionItem.id ? (
                      <>
                        <RadioGroup
                          defaultValue={
                            questionItem.id.toString() +
                            questionItem.Answer.findIndex(
                              (radioItem) => radioItem.isCorrect
                            ).toString()
                          }
                          onValueChange={(data) => {
                            console.log("data", data);
                            const getIndex = removePrefix(
                              Number(data),
                              questionItem.id
                            );

                            questionItem.Answer.forEach((answerItem, key) => {
                              answerForm.setValue(
                                `answers.${key}.isCorrect`,
                                false
                              );
                            });

                            answerForm.setValue(
                              `answers.${Number(getIndex)}.isCorrect`,
                              true
                            );
                          }}
                        >
                          {fields.map((answerItem, index) => (
                            <div
                              key={answerItem.id}
                              className="flex w-full items-center gap-3"
                            >
                              <RadioGroupItem
                                id={"r" + questionItem.id.toString() + index}
                                value={questionItem.id.toString() + index}
                              ></RadioGroupItem>
                              <>
                                <div className="w-full mb-2">
                                  <IInput
                                    defaultValue={answerItem.answerText}
                                    className="w-full"
                                    name={`answers.${index}.answerText`}
                                    control={answerForm.control}
                                    placeholder="Masukkan Jawaban"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  onClick={() => {
                                    remove(index);
                                  }}
                                >
                                  Hapus
                                </Button>
                              </>
                            </div>
                          ))}
                        </RadioGroup>
                      </>
                    ) : (
                      <>
                        <>
                          <RadioGroup
                            defaultValue={
                              questionItem.id.toString() +
                              questionItem.Answer.findIndex(
                                (radioItem) => radioItem.isCorrect
                              ).toString()
                            }
                            disabled={editAnswer !== questionItem.id}
                          >
                            {questionItem.Answer.map((answerItem, key) => (
                              <div className="flex w-full items-center gap-3">
                                <RadioGroupItem
                                  id={"r" + questionItem.id.toString() + key}
                                  value={questionItem.id.toString() + key}
                                ></RadioGroupItem>
                                <>
                                  <div className="w-full mb-2">
                                    <p>{answerItem.answerText}</p>
                                  </div>
                                </>
                              </div>
                            ))}
                          </RadioGroup>
                        </>
                      </>
                    )}
                  </div>
                </form>
              </Form>
              {editAnswer === questionItem.id && (
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      append({
                        id:
                          fields.length > 0
                            ? (fields.at(fields.length - 1)!.id + 1).toString()
                            : "1",
                        answerText: "",
                        isCorrect: false,
                      });
                      console.log(
                        "length",
                        fields.length > 0
                          ? (fields.at(fields.length - 1)!.id + 1).toString()
                          : "1"
                      );
                    }}
                  >
                    Tambah Jawaban
                  </Button>
                </div>
              )}
            </ICard>
          ))}
          {addQuestion && (
            <ICard>
              <Form {...questionForm}>
                <form
                  onSubmit={questionForm.handleSubmit(handleCreateQuestion)}
                >
                  <div className="flex gap-2 justify-between">
                    <div className="w-full">
                      {/* <div className="col-span-1"> */}
                      {/* <Image
                        alt=""
                        src={"/image/empty_image.png"}
                        width={400}
                        height={400}
                      ></Image>
                      {editQuestion === questionItem.id && (
                        <div className="flex gap-2 items-center">
                          <IInput
                            name="image"
                            control={questionForm.control}
                            type="file"
                          />
                          <div className="mt-2">
                            <Button variant={"destructive"} size="icon">
                              <Trash2 />
                            </Button>
                          </div>
                        </div>
                      )} */}
                      {/* </div> */}
                      <div className="col-span-2 flex flex-col gap-4 w-full">
                        <Label>Pertanyaan</Label>
                        <ITextArea
                          name="questionText"
                          control={questionForm.control}
                          rows={7}
                          placeholder="Masukkan Pertanyaan"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={"secondary"}
                        onClick={() => setAddQuestion(false)}
                      >
                        Batal
                      </Button>
                      <Button type="submit">Simpan</Button>
                    </div>
                  </div>
                </form>
              </Form>
            </ICard>
          )}
          {!addQuestion && (
            <Button
              onClick={() => {
                questionForm.reset();
                setAddQuestion(true);
                setEditAnswer(0);
                setEditQuestion(0);
              }}
            >
              Tambah Pertanyaan
            </Button>
          )}
        </div>
      </div>
      <DestroyQuestionDialog
        handleReset={handleReset}
        isOpen={showDestroyQuestionDialog}
        question={destroyQuestionData}
        setIsOpenDialog={setShowQuestionDialog}
      />
    </>
  );
};

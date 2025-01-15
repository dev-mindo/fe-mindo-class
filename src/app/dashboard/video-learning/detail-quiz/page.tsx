"use client";
import IInput from "@/components/base/IInput";
import ISelect from "@/components/base/ISelect";
import ISwitch from "@/components/base/ISwitch";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Label } from "@radix-ui/react-label";
import { useFieldArray, useForm } from "react-hook-form";

const hoursOption = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString(),
  label: i.toString(),
}));

const minutesOption = Array.from({ length: 60 }, (_, i) => ({
  value: i.toString(),
  label: i.toString(),
}));

const Page = () => {
  const form = useForm({
    defaultValues: {
      questions: [
        {
          question: "",
          answers: [
            {
              answer: "",
              isCorrect: false,
            },
            {
              answer: "",
              isCorrect: false,
            },
          ],
        },
      ],
    },
  });

  const {
    fields: questionField,
    append: questionAppend,
    remove,
    update,
  } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  return (
    <div className="w-full">
      <div>
        <h1>Detail Quiz</h1>
        <Form {...form}>
          <form action="">
            <div className="flex grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Quiz Config</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div>
                        Time Limit
                        <div className="flex items-center">
                          <ISelect
                            control={form.control}
                            name="timeLimit.hours"
                            placeholder="0"
                            options={hoursOption.map((item) => ({
                              value: item.value,
                              label: item.label,
                            }))}
                          ></ISelect>
                          <span className="mx-2"> : </span>
                          <ISelect
                            control={form.control}
                            name="timeLimit.minutes"
                            placeholder="0"
                            options={minutesOption.map((item) => ({
                              value: item.value,
                              label: item.label,
                            }))}
                          ></ISelect>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Label>Pagination</Label>
                        <ISwitch control={form.control} name="pagination" />
                      </div>
                      <div className="flex items-center gap-4">
                        <Label>Publish</Label>
                        <ISwitch control={form.control} name="publish" />
                      </div>
                      <div className="flex items-center gap-4">
                        <Label>Random</Label>
                        <ISwitch control={form.control} name="random" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p>Card Footer</p>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>List Question</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Card Content</p>
                  </CardContent>
                  <CardFooter>
                    <p>Card Footer</p>
                  </CardFooter>
                </Card>
              </div>
              <div className="col-span-2 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
                {questionField.map((field, index) => (
                  <Card>
                    <CardHeader>
                      <CardTitle>Question {index}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <IInput
                        label="Question"
                        control={form.control}
                        name={`question.${index}`}
                      ></IInput>
                      <div className="mt-4">
                        <Label>Answer</Label>
                        <div className="ml-4 w-full">
                          {field.answers.map((answer, answerIndex) => (
                            <div
                              key={answerIndex}
                              className="flex items-center gap-4"
                            >
                              <div className="w-full">
                                <IInput
                                  control={form.control}
                                  name={`questions.${index}.answers.${answerIndex}.answer`}
                                  placeholder={`Answer ${answerIndex + 1}`}
                                />
                              </div>
                              {/* Input untuk Jawaban */}
                              {/* Checkbox untuk isCorrect */}
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  className="form-checkbox"
                                  {...form.register(
                                    `questions.${index}.answers.${answerIndex}.isCorrect`
                                  )}
                                />
                                <span>Correct</span>
                              </label>
                              {/* Tombol Hapus Jawaban */}
                              <Button
                                type="button"
                                onClick={() => {
                                  const updatedAnswers = [...field.answers];
                                  updatedAnswers.splice(answerIndex, 1);
                                  update(index, {
                                    ...field,
                                    answers: updatedAnswers,
                                  });
                                }}
                              >
                                Hapus
                              </Button>
                            </div>
                          ))}
                          {/* Tombol Tambah Jawaban */}
                          <Button
                            type="button"
                            className="mt-2"
                            onClick={() => {
                              const updatedAnswers = [
                                ...field.answers,
                                { answer: "", isCorrect: false },
                              ];
                              update(index, {
                                ...field,
                                answers: updatedAnswers,
                              });
                            }}
                          >
                            Tambah Jawaban
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    {/* <CardFooter>
                  <p>Card Footer</p>
                </CardFooter> */}
                  </Card>
                ))}
                <div className="w-full mb-4">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() =>
                      questionAppend({
                        question: "",
                        answers: [
                          { answer: "", isCorrect: false },
                          { answer: "", isCorrect: false },
                        ],
                      })
                    }
                  >
                    Tambah Pertanyaan
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
      <div className="my-4 flex justify-between">
        <Button>Kembali</Button>
        <Button>Simpan</Button>
      </div>
    </div>
  );
};

export default Page;

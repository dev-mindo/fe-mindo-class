"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IRating } from "./IRating";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useEffect, useLayoutEffect } from "react";
import { watch } from "fs";
import ITextArea from "@/components/base/ITextArea";
import ICheckbox from "@/components/base/ICheckbox";

type Props = {
  showFormFeedback: TFormFeedback[];
  dataFormFeedback: Record<string, string | string[]>
};

export const FeedbackForm = ({ showFormFeedback, dataFormFeedback }: Props) => {

  const form = useForm({
    defaultValues: {
      ...dataFormFeedback,
    },
  });
  
  useEffect(() => {
    console.log(dataFormFeedback)
  }, [])

  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log(value);
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (data: any) => {};

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="w-[50%] mx-auto">
          <div className="flex flex-col gap-4 my-4">
            <div className="bg-card  p-4 rounded-lg">
              <h1 className="text-3xl">Evaluasi</h1>
            </div>
            {showFormFeedback.map((item, index) => (
              <>               
                {
                  <div key={index} className="bg-card p-4 rounded-lg">
                    <h1 className="text-2xl">{item.title}</h1>
                    <div className="my-4">
                      {item.type === "CHECKBOX" && (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center space-x-2">
                            <ICheckbox
                              control={form.control}
                              name={item.name}
                              items={item.value || []}
                            />
                          </div>
                        </div>
                      )}

                      {item.type === "RATING" && (
                        <IRating control={form.control} name={item.name} />
                      )}

                      {item.type === "TEXT" && (
                        <div className="my-4">
                          <ITextArea
                            control={form.control}
                            name={item.name}
                            placeholder="Tuliskan Jawaban Disini"
                            className="text-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                }
              </>
            ))}

            <div className="w-full">
              <Button type="submit" className="w-full">
                Selesai
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

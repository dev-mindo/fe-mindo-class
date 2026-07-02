"use client";
import { Button } from "@/components/ui/button";
import { IRating } from "./IRating";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { ITextArea } from "@/components/base/ITextArea";
import ICheckbox from "@/components/base/ICheckbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { formFeedbackSchema } from "@/schemas/FormFeedback";
import { z } from "zod";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import IRadio from "@/components/base/IRadio";

type Props = {
  evaluationId: string;
  feedbackUserId: string;
  showFormFeedback: TFormFeedback["formFeedback"];
  dataFormFeedback: Record<string, string | string[]>;
  // formFeedbackSchema: any
  baseUrl: string;
};

export const FeedbackForm = ({
  evaluationId,
  feedbackUserId,
  showFormFeedback,
  dataFormFeedback,
  baseUrl,
}: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const feedbackSchema = formFeedbackSchema.dynamicSchema(
    dataFormFeedback,
    showFormFeedback
  );
  const form = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      ...dataFormFeedback,
    },
  });

  useEffect(() => {
    console.log(dataFormFeedback);
  }, []);

  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log(value);
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (data: z.infer<typeof feedbackSchema>) => {
    setLoading(true);
    const formattedData = Object.entries(data).map(([key, value]) => ({
      name: key,
      answer: Array.isArray(value) ? `${value}` : value,
    }));
    console.log(formattedData);
    const saveFeedback: ApiResponse = await fetchApi(
      `/evaluation/${evaluationId}/feedback/${feedbackUserId}/save`,
      {
        method: "POST",
        body: {
          allAnswer: formattedData,
        },
      }
    );
    if (saveFeedback && saveFeedback.success) {
      router.push(baseUrl);
    } else {
      if (saveFeedback?.statusCode === 500) {
        toast.error("Server Error");
      }
      toast.error(saveFeedback?.message || "Gagal menyimpan evaluasi");
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-screen overflow-hidden bg-muted/30"
      >
        <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-4 py-5 sm:px-6">
          <div className="mb-4 rounded-lg border bg-card p-5 shadow-sm">
            <h1 className="text-2xl font-semibold">Evaluasi</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Semua pertanyaan wajib diisi sebelum menyelesaikan evaluasi.
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            {showFormFeedback.map((item, index) => (
              <div
                key={item.name || index}
                className="rounded-lg border bg-card p-5 shadow-sm"
              >
                <h2 className="text-lg font-medium leading-relaxed">
                  {item.title}
                </h2>
                <div className="mt-4">
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
                    <ITextArea
                      control={form.control}
                      name={item.name}
                      placeholder="Tuliskan jawaban di sini"
                      className="min-h-32 text-base"
                    />
                  )}

                  {item.type === "RADIO" && (
                    <IRadio
                      control={form.control}
                      items={item.value || []}
                      name={item.name}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t bg-muted/30 pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Please wait
                </>
              ) : (
                "Selesai"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

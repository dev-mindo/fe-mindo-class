import { z } from "zod";

const answerSchema = z.object({
  id: z.string(), // id opsional (kalau new answer belum punya id)
  answerText: z.string().min(1, "Jawaban harus diisi"),
  isCorrect: z.boolean(),
});

// Schema untuk form (berisi array of answers)

export const updateAnswerFormSchema = z
  .object({
    answers: z.array(answerSchema).min(1, "Harus ada minimal 1 jawaban"),
  })
  .refine((data) => data.answers.some((a) => a.isCorrect), {
    message: "Harus ada minimal satu jawaban yang benar",
    path: ["answers"], // tampil di bawah field array
  });

export type ModuleFormUpdateAnswer = z.infer<typeof updateAnswerFormSchema>;

export default updateAnswerFormSchema;

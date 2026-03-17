import { z } from "zod";

export const quizSchema = z.object({
  title: z
    .string({
      required_error: "Title wajib diisi",
      invalid_type_error: "Title harus berupa string",
    })
    .min(1, "Title tidak boleh kosong"),

  minimunScore: z
    .coerce.number({
      required_error: "Minimum score wajib diisi",
      invalid_type_error: "Minimum score harus berupa angka",
    })
    .min(0, "Minimum score tidak boleh negatif"),

  hour: z
    .coerce.number({
      required_error: "Jam wajib diisi",
      invalid_type_error: "Jam harus berupa angka",
    })
    .min(0, "Jam tidak boleh negatif"),

  minute: z
    .coerce.number({
      required_error: "Menit wajib diisi",
      invalid_type_error: "Menit harus berupa angka",
    })
    .min(0, "Menit tidak boleh negatif"),

  limitTrial: z
    .coerce.number({
      required_error: "Limit percobaan wajib diisi",
      invalid_type_error: "Limit percobaan harus berupa angka",
    })
    .min(0, "Limit tidak boleh negatif"),
});

export type QuizFormSchema = z.infer<typeof quizSchema>;

export default quizSchema;

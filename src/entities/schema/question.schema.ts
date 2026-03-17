import { z } from "zod";

const questionSchema = z.object({
    questionText: z.string().min(1)
})

export type QuestionFormSchema = z.infer<typeof questionSchema>;

export default questionSchema
import { z } from "zod";

const sectionSchema = z.object({
  productId: z.number().min(1),
  title: z.string().min(1),
  position: z.number().min(1),
  includeModule: z.boolean(),
});

export type SectionFormValues = z.infer<typeof sectionSchema>;

export default sectionSchema;

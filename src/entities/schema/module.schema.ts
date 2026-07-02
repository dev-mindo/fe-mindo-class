import { z } from "zod";

export enum ModuleType {
  INFO = "INFO",
  QUIZ = "QUIZ",
  VIDEO = "VIDEO",
  DISCUSSION = "DISCUSSION",
  EVALUATION = "EVALUATION",
  CERTIFICATE = "CERTIFICATE",
  MATERIAL = "MATERIAL",
  TASK = "TASK",
  LIVE = "LIVE",
}

const moduleSchema = z.object({
  sectionId: z.coerce.number().min(1),
  title: z.string().min(1, "Judul wajib diisi"),
  type: z.nativeEnum(ModuleType),
  menuTitle: z.string().min(1, "Menu title wajib diisi"),
  step: z.coerce.number().min(1),
  hide: z.boolean(),
  isLocked: z.boolean(),
  showAt: z.string().optional(),
});

export type ModuleFormValues = z.infer<typeof moduleSchema>;

export default moduleSchema

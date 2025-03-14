import { z } from "zod";

const dynamicSchema = (
  formattedFeedback: Record<string, string | string[]>,
  showFormFeedback: {
    name: string;
    required: boolean;
    type: string;
    title: string;
  }[]
) => {
  return z.object(
    showFormFeedback.reduce((acc, field) => {
      let fieldSchema;

      if (field.type === "RATING") {
        fieldSchema = z.string().min(1, `${field.title} wajib diisi`);
      } else if (field.type === "TEXT") {
        fieldSchema = z.string().min(1, `${field.title} wajib diisi`);
      } else if (field.type === "CHECKBOX") {
        fieldSchema = z
          .array(z.string())
          .min(1, `${field.title} wajib dipilih`);
      } else {
        fieldSchema = z.any();
      }

      if (!field.required) {
        fieldSchema = fieldSchema.optional();
      }

      acc[field.name] = fieldSchema;
      return acc;
    }, {} as Record<string, any>)
  );
};

export const formFeedbackSchema = {
  dynamicSchema,
};

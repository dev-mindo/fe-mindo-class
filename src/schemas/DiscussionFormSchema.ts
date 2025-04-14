import { z } from "zod";

const newDiscussionField = z.object({
  title: z.string().min(1),
  question: z.string().min(1),
});

const discussionFormSchema = {
    newDiscussionField,
};

export default discussionFormSchema;

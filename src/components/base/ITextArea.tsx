import { FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { ReactElement } from "react";
import { TTextAreaProps } from "@/entities/common";

export const ITextArea = <T extends FieldValues>(
  props: TTextAreaProps<T>
): ReactElement => {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem>
          {props.label && <FormLabel>{props.label}</FormLabel>}
          <FormControl>
            <Textarea
              className={`${props.className} resize-none`}
              {...field}
              {...props}
              rows={props.rows || 4}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

import { Control, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { TInputProps } from "@/entities/common";
import { ReactElement } from "react";

export const IInput = <T extends FieldValues>(
  props: TInputProps<T>
): ReactElement => {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{props.label}</FormLabel>
          <FormControl>
            <Input
              {...props}              
              {...field}
              type={props.type ? props.type : "text"}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

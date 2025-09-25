import { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { FieldValues, UseControllerProps } from "react-hook-form";

export type TInput = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export type TInputProps<T extends FieldValues> = UseControllerProps<T> &
  TInput & { label?: string; description?: string; isDiscount?: boolean };
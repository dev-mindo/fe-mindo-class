import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { FieldValues, UseControllerProps } from "react-hook-form";

export type TTextArea = DetailedHTMLProps<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>;

export type TInput = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export type TInputProps<T extends FieldValues> = UseControllerProps<T> &
  TInput & { label?: string; description?: string; isDiscount?: boolean };

export type TTextAreaProps<T extends FieldValues> = UseControllerProps<T> &
  TTextArea & {
    label?: string;
    description?: string;
    isDiscount?: boolean;  // jika perlu konsisten dengan TInputProps
  };
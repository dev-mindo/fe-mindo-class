import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import moment from "moment";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToMidnight(datetime: string): string {
  return moment(datetime).startOf("day").format("YYYY-MM-DD HH:mm:ss");
}

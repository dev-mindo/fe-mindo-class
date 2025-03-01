import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import moment from "moment";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToMidnight(datetime: string): string {
  return moment(datetime).startOf("day").format("YYYY-MM-DD HH:mm:ss");
}

export function getDurationTimeNow(timeLimit: string) {
  // Waktu target
  const targetTime = moment(timeLimit);

  // Waktu sekarang
  const now = moment();

  // Hitung selisih waktu
  const duration = moment.duration(targetTime.diff(now));

  // Ambil selisih dalam hari, jam, menit, dan detik
  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();
  return `${hours}:${minutes}:${seconds}`
}

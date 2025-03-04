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
  return `${hours}:${minutes}:${seconds}`;
}

export function convertTimeToWords(time: string) {
  const match = time.match(/^(\d+):(\d+)$/);
  if (match) {
    const hours = parseInt(match[1], 10); // Jam
    const minutes = parseInt(match[2], 10); // Menit
    let result = "";
    if (hours > 0) result += `${hours} jam`;
    if (minutes > 0) result += `${minutes} menit`;
    return result;
  } else {
    console.log("Format waktu tidak valid");
    throw new Error("Format waktu tidak valid");
  }
}

export function convertSnakeToTitleCase(text: string): string {
  return text
    .toLowerCase() // Step 1: Ubah ke huruf kecil
    .split("_") // Step 2: Pisahkan berdasarkan "_"
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Step 3: Kapitalisasi
    .join(" "); // Step 4: Gabungkan dengan spasi
}

export function convertSnakeToKebab (text: string): string {
  return text.toLowerCase().split("_").join("-");
};
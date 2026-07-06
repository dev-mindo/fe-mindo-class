import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import moment from "moment";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToMidnight(datetime: string): string {
  return moment(datetime).startOf("day").format("YYYY-MM-DD HH:mm:ss");
}

export function toOffsetDateTime(value?: string | Date | null): string | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const timezoneOffset = -date.getTimezoneOffset();
  const sign = timezoneOffset >= 0 ? "+" : "-";
  const offsetHours = String(Math.floor(Math.abs(timezoneOffset) / 60)).padStart(
    2,
    "0"
  );
  const offsetMinutes = String(Math.abs(timezoneOffset) % 60).padStart(2, "0");
  const localDateTime = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 19);

  const offsetDateTime = `${localDateTime}${sign}${offsetHours}:${offsetMinutes}`;

  console.log("[timezone]", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    currentTime: new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZoneName: "short",
    }),
    input: value,
    output: offsetDateTime,
  });

  return offsetDateTime;
}

export function getDurationTimeNow(timeLimit: string) {
  // Waktu target
  const targetTime = moment(timeLimit);

  // Waktu sekarang
  const now = moment();

  // Hitung selisih waktu
  const duration = moment.duration(targetTime.diff(now));

  // Ambil selisih dalam hari, jam, menit, dan detik
  // const days = duration.days();
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

export function removePrefix(number: number, input: number) {
  // ubah ke string supaya mudah manipulasi
  const strNumber = String(number);
  const strInput = String(input);

  // jika angka diawali dengan input
  if (strNumber.startsWith(strInput)) {
    // hapus bagian depan yang sesuai input
    return strNumber.slice(strInput.length);
  }

  // jika tidak diawali dengan input, kembalikan angka asli
  return strNumber;
}

import { useState, useEffect } from "react";

interface CountdownProps {
  targetTime: string; // Waktu target dalam format "HH:mm:ss"
  setTimeEnd: () => void;
  setAlertTime: (time: number) => void;
}

export default function Countdown({
  targetTime,
  setTimeEnd,
  setAlertTime,
}: CountdownProps) {
  // Fungsi untuk mengonversi "HH:mm:ss" menjadi detik
  const timeToSeconds = (time: string): number => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const [timeLeft, setTimeLeft] = useState(timeToSeconds(targetTime));

  useEffect(() => {
    if (timeLeft <= 0) {
      setTimeEnd();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));      
      if(timeLeft === 600 || timeLeft === 300 || timeLeft === 60){
        setAlertTime(timeLeft / 60)
      }      
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // Fungsi untuk mengonversi detik ke format HH:mm:ss
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
  };

  return <h1>{formatTime(timeLeft)}</h1>;
}

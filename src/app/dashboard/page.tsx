import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Users,
  Video,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DashboardPageTitle } from "./_component/page-title";

type ScheduleItem = {
  id: number;
  date: string;
  time: string;
  title: string;
  className: string;
  type: "Live Class" | "Quiz" | "Tugas" | "Evaluasi";
  status: "Hari ini" | "Mendatang" | "Selesai";
  participantCount: number;
};

const schedules: ScheduleItem[] = [
  {
    id: 1,
    date: "2026-07-22",
    time: "09:00 - 10:30",
    title: "Live Session: Product Discovery",
    className: "Product Management",
    type: "Live Class",
    status: "Hari ini",
    participantCount: 32,
  },
  {
    id: 2,
    date: "2026-07-23",
    time: "13:00 - 14:00",
    title: "Quiz Modul 3",
    className: "UI/UX Design Fundamental",
    type: "Quiz",
    status: "Mendatang",
    participantCount: 28,
  },
  {
    id: 3,
    date: "2026-07-25",
    time: "23:59",
    title: "Deadline Tugas Wireframe",
    className: "UI/UX Design Fundamental",
    type: "Tugas",
    status: "Mendatang",
    participantCount: 28,
  },
  {
    id: 4,
    date: "2026-07-27",
    time: "10:00 - 11:30",
    title: "Evaluasi Akhir Kelas",
    className: "Frontend Developer",
    type: "Evaluasi",
    status: "Mendatang",
    participantCount: 36,
  },
  {
    id: 5,
    date: "2026-07-30",
    time: "15:00 - 16:30",
    title: "Live Coding: Component State",
    className: "Frontend Developer",
    type: "Live Class",
    status: "Mendatang",
    participantCount: 36,
  },
];

const calendarYear = 2026;
const calendarMonthIndex = 6;
const todayDate = 22;
const monthName = "Juli 2026";
const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const getCalendarDays = () => {
  const firstDay = new Date(calendarYear, calendarMonthIndex, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();
  const previousMonthDays = new Date(
    calendarYear,
    calendarMonthIndex,
    0
  ).getDate();

  return Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - firstDay + 1;

    if (dayNumber < 1) {
      return {
        day: previousMonthDays + dayNumber,
        dateKey: "",
        isCurrentMonth: false,
      };
    }

    if (dayNumber > daysInMonth) {
      return {
        day: dayNumber - daysInMonth,
        dateKey: "",
        isCurrentMonth: false,
      };
    }

    return {
      day: dayNumber,
      dateKey: `${calendarYear}-${String(calendarMonthIndex + 1).padStart(
        2,
        "0"
      )}-${String(dayNumber).padStart(2, "0")}`,
      isCurrentMonth: true,
    };
  });
};

const getTypeClassName = (type: ScheduleItem["type"]) => {
  if (type === "Live Class") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (type === "Quiz") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (type === "Tugas") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-violet-200 bg-violet-50 text-violet-700";
};

const getStatusClassName = (status: ScheduleItem["status"]) => {
  if (status === "Hari ini") {
    return "bg-primary text-primary-foreground";
  }

  if (status === "Selesai") {
    return "bg-muted text-muted-foreground";
  }

  return "bg-secondary text-secondary-foreground";
};

const formatDateId = (date: string) => {
  const [year, month, day] = date.split("-");

  return `${day} ${monthNames[Number(month) - 1]} ${year}`;
};

const calendarDays = getCalendarDays();
const schedulesByDate = schedules.reduce<Record<string, ScheduleItem[]>>(
  (accumulator, schedule) => {
    accumulator[schedule.date] = [...(accumulator[schedule.date] ?? []), schedule];
    return accumulator;
  },
  {}
);
const todaySchedules = schedules.filter((schedule) => schedule.status === "Hari ini");
const upcomingSchedules = schedules.filter(
  (schedule) => schedule.status === "Mendatang"
);

const Page = () => {
  return (
    <div className="w-full space-y-6">
      <DashboardPageTitle title="Dashboard" />

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jadwal Hari Ini</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{todaySchedules.length}</div>
            <p className="text-xs text-muted-foreground">
              Kegiatan aktif pada 22 Juli 2026
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agenda Mendatang</CardTitle>
            <Clock3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{upcomingSchedules.length}</div>
            <p className="text-xs text-muted-foreground">
              Jadwal kelas, tugas, quiz, dan evaluasi
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peserta Terjadwal</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {schedules.reduce((total, schedule) => total + schedule.participantCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Akumulasi peserta dari semua agenda
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="gap-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CalendarDays className="h-5 w-5" />
                  Kalender Jadwal
                </CardTitle>
                <CardDescription>
                  Ringkasan kegiatan kelas untuk {monthName}
                </CardDescription>
              </div>
              <Badge variant="outline" className="w-fit text-sm">
                {monthName}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 border-b text-center text-xs font-medium text-muted-foreground">
              {dayNames.map((dayName) => (
                <div key={dayName} className="py-3">
                  {dayName}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 overflow-hidden rounded-b-lg border border-t-0">
              {calendarDays.map((calendarDay, index) => {
                const daySchedules = calendarDay.dateKey
                  ? schedulesByDate[calendarDay.dateKey] ?? []
                  : [];
                const isToday =
                  calendarDay.isCurrentMonth && calendarDay.day === todayDate;

                return (
                  <div
                    key={`${calendarDay.day}-${index}`}
                    className={cn(
                      "min-h-28 border-b border-r bg-background p-2 last:border-r-0",
                      index % 7 === 6 && "border-r-0",
                      index >= 35 && "border-b-0",
                      !calendarDay.isCurrentMonth && "bg-muted/30 text-muted-foreground"
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                          isToday && "bg-primary text-primary-foreground"
                        )}
                      >
                        {calendarDay.day}
                      </span>
                      {daySchedules.length > 0 ? (
                        <span className="text-xs font-medium text-primary">
                          {daySchedules.length}
                        </span>
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      {daySchedules.slice(0, 2).map((schedule) => (
                        <div
                          key={schedule.id}
                          className={cn(
                            "truncate rounded-md border px-2 py-1 text-xs font-medium",
                            getTypeClassName(schedule.type)
                          )}
                          title={schedule.title}
                        >
                          {schedule.title}
                        </div>
                      ))}
                      {daySchedules.length > 2 ? (
                        <div className="text-xs text-muted-foreground">
                          +{daySchedules.length - 2} jadwal
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle>Daftar Jadwal</CardTitle>
            <CardDescription>Agenda terdekat yang perlu dipantau</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="rounded-lg border p-4 transition-colors hover:bg-muted/40"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getStatusClassName(schedule.status)}>
                        {schedule.status}
                      </Badge>
                      <Badge variant="outline" className={getTypeClassName(schedule.type)}>
                        {schedule.type}
                      </Badge>
                    </div>
                    <h3 className="font-semibold leading-snug">{schedule.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {schedule.className}
                    </p>
                  </div>
                  {schedule.type === "Live Class" ? (
                    <Video className="mt-1 h-4 w-4 text-blue-600" />
                  ) : (
                    <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-600" />
                  )}
                </div>
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {formatDateId(schedule.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4" />
                    {schedule.time}
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Users className="h-4 w-4" />
                    {schedule.participantCount} peserta
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Page;

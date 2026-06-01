import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { getProgressValue, getStatusLabel } from "./utils";

type Props = {
  dataProgress: TDTModuleProgress[];
  moduleTitleById: Record<number, string>;
};

export const UserProgressView = ({ dataProgress, moduleTitleById }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-3">
      {dataProgress.map((item) => {
        const progressValue = getProgressValue(item.progress);
        const completedModule = item.moduleProgress.filter(
          (progressItem) => progressItem.status === "DONE",
        ).length;

        return (
          <Card key={item.userId}>
            <CardHeader className="p-3 pb-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-sm">{item.name}</CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {completedModule} dari {item.moduleProgress.length} modul
                    selesai
                  </p>
                </div>
                <Badge
                  className="h-6 px-2 text-[11px]"
                  variant={progressValue === 100 ? "default" : "outline"}
                >
                  {item.progress}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <Progress value={progressValue} className="mb-3 h-2" />
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-4 xl:grid-cols-5">
                {item.moduleProgress.map((progressItem) => {
                  const isDone = progressItem.status === "DONE";
                  const title =
                    moduleTitleById[progressItem.moduleId] ??
                    `Modul ${progressItem.moduleId}`;

                  return (
                    <div
                      key={progressItem.moduleId}
                      className="flex min-h-10 items-center justify-between gap-2 rounded-md border px-2 py-1.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{title}</p>
                        <p className="text-[11px] leading-4 text-muted-foreground">
                          {progressItem.type}
                        </p>
                      </div>
                      <Badge
                        variant={isDone ? "default" : "secondary"}
                        className="h-5 shrink-0 gap-1 px-1.5"
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <CircleDashed className="h-3 w-3" />
                        )}
                        <span className="text-[10px]">
                          {getStatusLabel(progressItem.status)}
                        </span>
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

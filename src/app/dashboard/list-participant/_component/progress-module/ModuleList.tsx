import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import type { ModuleProgressItem } from "./types";
import { isDiscussionModule } from "./utils";

type Props = {
  progressByModule: ModuleProgressItem[];
  selectedModuleProgress?: ModuleProgressItem;
  moduleDiscussions: Record<number, TModuleDiscussion>;
  setSelectedModuleId: (moduleId: number) => void;
};

export const ModuleList = ({
  progressByModule,
  selectedModuleProgress,
  moduleDiscussions,
  setSelectedModuleId,
}: Props) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm">Daftar Module</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Pilih module untuk melihat user yang sudah mengakses.
            </p>
          </div>
          <Badge variant="secondary">{progressByModule.length} module</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid max-h-[520px] gap-1.5 overflow-y-auto p-2">
        {progressByModule.map((moduleItem) => {
          const isSelected =
            selectedModuleProgress?.moduleId === moduleItem.moduleId;
          const discussionCount =
            moduleDiscussions[moduleItem.moduleId]?.length ?? 0;

          return (
            <button
              key={moduleItem.moduleId}
              type="button"
              onClick={() => setSelectedModuleId(moduleItem.moduleId)}
              className={`rounded-md border px-2 py-1.5 text-left transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "bg-background hover:bg-muted"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">
                    {moduleItem.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                    {moduleItem.completedParticipant} dari{" "}
                    {moduleItem.participants.length} peserta
                  </p>
                  {isDiscussionModule(moduleItem.type) && discussionCount > 0 ? (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-primary">
                      <MessageSquare className="h-3 w-3" />
                      {discussionCount} pertanyaan
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {isDiscussionModule(moduleItem.type) && discussionCount > 0 ? (
                    <Badge className="h-5 px-1.5 text-[10px]">Baru</Badge>
                  ) : null}
                  <Badge
                    variant={isSelected ? "default" : "outline"}
                    className="h-5 px-1.5 text-[10px]"
                  >
                    Step{" "}
                    {moduleItem.step === Number.MAX_SAFE_INTEGER
                      ? "-"
                      : moduleItem.step}
                  </Badge>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
};

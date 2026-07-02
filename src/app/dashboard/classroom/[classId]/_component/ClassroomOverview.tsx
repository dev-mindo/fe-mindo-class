import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  dataClass: TClassModuleDetail | null;
  totalModule: number;
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ClassroomOverview = ({ dataClass, totalModule }: Props) => {
  const modules =
    dataClass?.sections.flatMap((section) =>
      section.module.map((module) => ({
        ...module,
        sectionTitle: section.title,
      }))
    ) ?? [];

  return (
    <Card className="rounded-lg shadow-sm">
      <CardHeader className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-base">Data Kelas</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{dataClass?.sections.length ?? 0} Section</Badge>
          <Badge variant="outline">{totalModule} Module</Badge>
          <Badge variant="secondary">
            {dataClass?.isAutoGetCertificate ? "Auto Certificate" : "Manual Certificate"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 pt-0 lg:grid-cols-3">
        <div className="rounded-md border p-3">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Kelas
          </p>
          <div className="mt-2 space-y-1 text-sm">
            <p className="truncate font-medium">{dataClass?.title ?? "-"}</p>
            <p className="text-muted-foreground">
              {dataClass?.productType ?? "-"}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant={dataClass?.publish ? "default" : "secondary"}>
                {dataClass?.publish ? "Published" : "Draft"}
              </Badge>
              <Badge variant="outline">
                {formatDateTime(dataClass?.publishTime)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-md border p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Section
            </p>
            <Badge variant="secondary">
              {dataClass?.sections.length ?? 0}
            </Badge>
          </div>
          <div className="mt-2 space-y-2">
            {dataClass?.sections.length ? (
              dataClass.sections.slice(0, 4).map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <p className="min-w-0 truncate">
                    {section.position}. {section.title}
                  </p>
                  <Badge variant="outline" className="shrink-0">
                    {section.module.length} module
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada section.</p>
            )}
            {(dataClass?.sections.length ?? 0) > 4 ? (
              <p className="text-xs text-muted-foreground">
                +{(dataClass?.sections.length ?? 0) - 4} section lainnya
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-md border p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Module
            </p>
            <Badge variant="secondary">{totalModule}</Badge>
          </div>
          <div className="mt-2 space-y-2">
            {modules.length ? (
              modules.slice(0, 5).map((module) => (
                <div key={module.id} className="min-w-0 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="shrink-0">
                      Step {module.step}
                    </Badge>
                    <p className="min-w-0 truncate font-medium">
                      {module.title}
                    </p>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {module.sectionTitle} - {module.type}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada module.</p>
            )}
            {modules.length > 5 ? (
              <p className="text-xs text-muted-foreground">
                +{modules.length - 5} module lainnya
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

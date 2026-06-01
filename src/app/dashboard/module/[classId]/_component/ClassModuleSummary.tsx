import { Badge } from "@/components/ui/badge";
import {
  Award,
  BookOpen,
  CalendarClock,
  Clock,
  ImageIcon,
  Layers,
  Link2,
  RadioTower,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  dataClassModule: TClassModuleDetail | null;
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

const SummaryItem = ({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) => {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-muted">
        {icon}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-1 break-words font-medium">{children}</div>
    </div>
  );
};

export const ClassModuleSummary = ({ dataClassModule }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <SummaryItem icon={<BookOpen size={18} />} label="Title">
        {dataClassModule?.title || "-"}
      </SummaryItem>
      <SummaryItem icon={<Layers size={18} />} label="Tipe Produk">
        {dataClassModule?.productType || "-"}
      </SummaryItem>
      <SummaryItem icon={<RadioTower size={18} />} label="Publish">
        <Badge variant={dataClassModule?.publish ? "default" : "secondary"}>
          {dataClassModule?.publish ? "Published" : "Draft"}
        </Badge>
      </SummaryItem>            
      <SummaryItem icon={<Award size={18} />} label="Auto Certificate">
        <Badge
          variant={
            dataClassModule?.isAutoGetCertificate ? "default" : "secondary"
          }
        >
          {dataClassModule?.isAutoGetCertificate ? "Aktif" : "Nonaktif"}
        </Badge>
      </SummaryItem>
      <SummaryItem icon={<Users size={18} />} label="Jumlah Peserta">
        {dataClassModule?._count?.userClass ?? 0}
      </SummaryItem>
      <SummaryItem icon={<Layers size={18} />} label="Jumlah Section">
        {dataClassModule?.sections.length ?? 0}
      </SummaryItem>      
    </div>
  );
};

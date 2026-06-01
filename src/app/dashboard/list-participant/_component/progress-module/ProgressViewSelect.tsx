import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ViewMode } from "./types";

type Props = {
  viewMode: ViewMode;
  setViewMode: (viewMode: ViewMode) => void;
};

export const ProgressViewSelect = ({ viewMode, setViewMode }: Props) => {
  return (
    <div className="flex flex-col gap-2 sm:max-w-xs">
      <p className="text-sm font-medium">Tampilan Progress</p>
      <Select
        value={viewMode}
        onValueChange={(value) => setViewMode(value as ViewMode)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Pilih tampilan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">Progress user berisi modul</SelectItem>
          <SelectItem value="module">User berdasarkan module</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

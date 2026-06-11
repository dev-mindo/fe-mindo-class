import ICard from "@/components/base/ICard";
import { EditModule } from "./EditModule";

type Props = {
  classId: string;
  moduleId: number;
  showEditModule: boolean;
  setShowEditModule: (isShowing: boolean) => void;
  getClassModule: () => void;
};

export const EditModuleAside = ({
  classId,
  moduleId,
  showEditModule,
  setShowEditModule,
  getClassModule,
}: Props) => {
  return (
    <ICard className="self-start overflow-hidden xl:sticky xl:top-4">
      {showEditModule && moduleId > 0 ? (
        <EditModule
          classId={classId}
          moduleId={moduleId}
          setShowEditModule={setShowEditModule}
          showEditModule={showEditModule}
          getClassModule={getClassModule}
        />
      ) : (
        <div className="flex items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div>
            <h2 className="font-semibold">Pilih Modul</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Klik tombol edit pada salah satu modul untuk mengubah detailnya.
            </p>
          </div>
        </div>
      )}
    </ICard>
  );
};

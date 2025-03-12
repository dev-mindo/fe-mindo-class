'use client'
import { useAppContext } from "../navProvider";

export const MainContent = ({ children }: { children: React.ReactNode }) => {
  const { hideAll, setHideAll } = useAppContext();

  if (hideAll) {
    return <>{children}</>;
  }

  return (
    <div className="overflow-y-auto h-[calc(100%-4rem)]">
      <div className="mx-auto w-[95%] my-10">{children}</div>
    </div>
  );
};

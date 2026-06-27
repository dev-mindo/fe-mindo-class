import ICard from "@/components/base/ICard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GripVertical, Plus, SquarePen, Trash } from "lucide-react";
import type { DragEvent } from "react";
import type { DragItem, ModuleDropTarget } from "./moduleTypes";

type SectionData = {
  id: number;
  title: string;
};

type Props = {
  dataClassModule: TClassModuleDetail | null;
  totalModule: number;
  dragItem: DragItem | null;
  moduleDropTarget: ModuleDropTarget | null;
  readOnly?: boolean;
  setDragItem: (dragItem: DragItem | null) => void;
  setModuleDropTarget: (target: ModuleDropTarget | null) => void;
  setDataSection: (section: SectionData) => void;
  setModuleId: (moduleId: number) => void;
  setShowEditModule: (isShowing: boolean) => void;
  setDataDeleteModuleDialog: (module: SectionData) => void;
  setOpenDeleteModuleDialog: (isOpen: boolean) => void;
  setOpenSectionEditDialog: (isOpen: boolean) => void;
  setOpenSectionDestroyDialog: (isOpen: boolean) => void;
  setAddStepNumber: (step: number) => void;
  handleAddModule: () => void;
  handleAddSection: () => void;
  handleModuleDrop: (
    targetSectionId: number,
    targetModuleId?: number,
    position?: ModuleDropTarget["position"]
  ) => void;
  handleModuleDragOver: (
    event: DragEvent<HTMLElement>,
    sectionId: number,
    moduleId: number
  ) => void;
  handleModuleListDragOver: (
    event: DragEvent<HTMLElement>,
    sectionId: number
  ) => void;
};

export const ModuleStructure = ({
  dataClassModule,
  totalModule,
  dragItem,
  moduleDropTarget,
  readOnly = false,
  setDragItem,
  setModuleDropTarget,
  setDataSection,
  setModuleId,
  setShowEditModule,
  setDataDeleteModuleDialog,
  setOpenDeleteModuleDialog,
  setOpenSectionEditDialog,
  setOpenSectionDestroyDialog,
  setAddStepNumber,
  handleAddModule,
  handleAddSection,
  handleModuleDrop,
  handleModuleDragOver,
  handleModuleListDragOver,
}: Props) => {
  const allowDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const isNoDragTarget = (target: EventTarget | null) => {
    return (
      target instanceof HTMLElement && Boolean(target.closest("[data-no-drag]"))
    );
  };

  const renderModuleDropPlaceholder = (
    sectionId: number,
    moduleId?: number,
    position?: ModuleDropTarget["position"]
  ) => {
    const isActive =
      moduleDropTarget?.sectionId === sectionId &&
      moduleDropTarget.moduleId === moduleId &&
      moduleDropTarget.position === position;

    if (!isActive) {
      return null;
    }

    return (
      <div
        onDragOver={allowDrop}
        onDrop={(event) => {
          if (dragItem?.type === "module") {
            event.stopPropagation();
            handleModuleDrop(sectionId, moduleId, position);
          }
        }}
        className="h-14 rounded-md border border-dashed border-primary/60 bg-primary/5 transition-all"
      />
    );
  };

  return (
    <ICard className="flex min-h-[520px] flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Struktur Modul</h2>
          <p className="text-sm text-muted-foreground">
            {dataClassModule?.sections.length ?? 0} section, {totalModule} modul
          </p>
        </div>
        {!readOnly ? (
          <Button onClick={handleAddSection} size="sm" variant="outline">
            <Plus size={16} />
            Section
          </Button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4">
        {dataClassModule?.sections.length ? (
          dataClassModule.sections.map((sectionItem) => {
            const sectionModules = sectionItem.module ?? [];

            return (
              <div
                key={sectionItem.id}
                className="rounded-md border bg-background transition-colors"
              >
                <div className="flex items-start justify-between gap-3 border-b p-4">
                  <div className="flex min-w-0 gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {sectionItem.title}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {sectionModules.length} modul
                      </div>
                    </div>
                  </div>
                  {!readOnly ? <div className="flex shrink-0">
                    <Button
                      onClick={() => {
                        setDataSection({
                          id: sectionItem.id,
                          title: sectionItem.title,
                        });
                        setOpenSectionEditDialog(true);
                      }}
                      size="icon"
                      variant="ghost"
                    >
                      <SquarePen size={18} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setDataSection({
                          id: sectionItem.id,
                          title: sectionItem.title,
                        });
                        setOpenSectionDestroyDialog(true);
                      }}
                    >
                      <Trash size={18} />
                    </Button>
                  </div> : null}
                </div>

                <div
                  onDragOver={(event) => {
                    if (!readOnly) {
                      handleModuleListDragOver(event, sectionItem.id);
                    }
                  }}
                  onDrop={(event) => {
                    if (dragItem?.type === "module") {
                      event.stopPropagation();
                      handleModuleDrop(sectionItem.id, undefined, "end");
                    }
                  }}
                  className="flex flex-col gap-2 p-3"
                >
                  {sectionModules.length ? (
                    <>
                      {sectionModules.map((moduleItem) => (
                        <div key={moduleItem.id} className="flex flex-col gap-2">
                          {renderModuleDropPlaceholder(
                            sectionItem.id,
                            moduleItem.id,
                            "before"
                          )}
                        <div
                          draggable={!readOnly}
                          onDragStart={(event) => {
                            if (readOnly || isNoDragTarget(event.target)) {
                              event.preventDefault();
                              return;
                            }

                            event.dataTransfer.effectAllowed = "move";
                            event.dataTransfer.setData(
                              "text/plain",
                              `module-${moduleItem.id}`
                            );
                            setDragItem({
                              type: "module",
                              sectionId: sectionItem.id,
                              moduleId: moduleItem.id,
                            });
                          }}
                          onDragEnd={() => {
                            setDragItem(null);
                            setModuleDropTarget(null);
                          }}
                          onDragOver={(event) => {
                            if (!readOnly) {
                              handleModuleDragOver(
                                event,
                                sectionItem.id,
                                moduleItem.id
                              );
                            }
                          }}
                          onDrop={(event) => {
                            if (dragItem?.type === "module") {
                              event.stopPropagation();
                              handleModuleDrop(
                                sectionItem.id,
                                moduleItem.id,
                                moduleDropTarget?.position ?? "before"
                              );
                            }
                          }}
                          className={`flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2 transition-colors ${
                            readOnly
                              ? ""
                              : "cursor-grab active:cursor-grabbing"
                          } ${
                            dragItem?.type === "module" &&
                            dragItem.moduleId === moduleItem.id
                              ? "opacity-50"
                              : dragItem?.type === "module"
                              ? "border-primary/50"
                              : ""
                          }`}
                        >
                          <div className="flex min-w-0 gap-2">
                            {!readOnly ? <button
                              type="button"
                              className="mt-0.5 rounded-md p-1 text-muted-foreground"
                              aria-label={`Pindahkan modul ${moduleItem.title}`}
                            >
                              <GripVertical size={18} />
                            </button> : null}
                            <div className="min-w-0">
                              <div className="truncate font-medium">
                                {moduleItem.title}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">
                                  Step {moduleItem.step}
                                </Badge>
                                <Badge>{moduleItem.type}</Badge>
                                {moduleItem.hide ? (
                                  <Badge variant="outline">Hidden</Badge>
                                ) : null}
                                {moduleItem.isLocked ? (
                                  <Badge variant="outline">Locked</Badge>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          {!readOnly ? <div className="flex shrink-0 gap-1" data-no-drag>
                            <Button
                              onClick={() => {
                                setModuleId(moduleItem.id);
                                setShowEditModule(true);
                              }}
                              size="icon"
                              variant="ghost"
                            >
                              <SquarePen size={18} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setDataDeleteModuleDialog({
                                  id: moduleItem.id,
                                  title: moduleItem.title,
                                });
                                setOpenDeleteModuleDialog(true);
                              }}
                            >
                              <Trash size={18} />
                            </Button>
                          </div> : null}
                        </div>
                        {renderModuleDropPlaceholder(
                          sectionItem.id,
                          moduleItem.id,
                          "after"
                        )}
                      </div>
                    ))}
                      {renderModuleDropPlaceholder(
                        sectionItem.id,
                        undefined,
                        "end"
                      )}
                    </>
                  ) : (
                    <div
                      onDragOver={allowDrop}
                      onDrop={(event) => {
                        if (dragItem?.type === "module") {
                          event.stopPropagation();
                          handleModuleDrop(sectionItem.id, undefined, "end");
                        }
                      }}
                      className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground"
                    >
                      Belum ada modul di section ini.
                    </div>
                  )}
                </div>

                {!readOnly ? <Button
                  onClick={() => {
                    handleAddModule();
                    setDataSection({
                      id: sectionItem.id,
                      title: sectionItem.title,
                    });
                    const getLastNumber = sectionModules.at(
                      sectionModules.length - 1
                    );
                    setAddStepNumber(
                      getLastNumber && getLastNumber.step
                        ? getLastNumber.step + 1
                        : 1
                    );
                  }}
                  variant="outline"
                  className="mx-3 mb-3 w-[calc(100%-1.5rem)]"
                >
                  <Plus />
                  Tambah Module
                </Button> : null}
              </div>
            );
          })
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-md border border-dashed p-8 text-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Belum ada section untuk kelas ini.
              </p>
              {!readOnly ? <Button
                onClick={handleAddSection}
                size="sm"
                variant="outline"
                className="mt-4"
              >
                <Plus size={16} />
                Tambah Section
              </Button> : null}
            </div>
          </div>
        )}
      </div>
    </ICard>
  );
};

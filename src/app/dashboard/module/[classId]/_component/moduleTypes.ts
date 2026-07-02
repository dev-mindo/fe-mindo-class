export type SectionItem = TClassModuleDetail["sections"][number];

export type DragItem = {
  type: "module";
  sectionId: number;
  moduleId: number;
};

export type ModuleDropTarget = {
  sectionId: number;
  moduleId?: number;
  position: "before" | "after" | "end";
};

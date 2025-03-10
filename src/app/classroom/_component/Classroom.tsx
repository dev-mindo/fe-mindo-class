"use client";

import { CardClass } from "./CardClass";

type Props = {
  dataClassroom: TClassroom[] | undefined;
};

export const Classroom = ({ dataClassroom }: Props) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {dataClassroom?.map((item, index) => (
        <CardClass
          key={index}
          title={item.title}
          thumbnail={item.thumbnail}
          createdAt={item.createdAt}
          type={item.productType}
          slug={item.slug}
        />
      ))}
    </div>
  );
};

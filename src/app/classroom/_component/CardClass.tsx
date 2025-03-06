import { Button } from "@/components/ui/button";
import { convertSnakeToKebab, convertSnakeToTitleCase } from "@/lib/utils";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";

type Props = {
  thumbnail: string;
  title: string;
  createdAt: string;
  type: string;
  slug: string;
};

export const CardClass = (props: Props) => {
  return (
    <div className="p-4 bg-card h-[100%] rounded-lg mt-4">
      <div className="flex flex-col gap-4">
        <Image
          className="rounded-lg"
          src={props.thumbnail}
          alt=""
          width={400}
          height={400}
        />
        <div className="flex flex-col gap-4">
          <h1 className="text-lg">{props.title}</h1>
          <p>{convertSnakeToTitleCase(props.type)}</p>
          <p>{moment(props.createdAt).format("yyyy-mm-DD")}</p>
        </div>
        <Button asChild>
          <Link
            href={`${process.env.NEXT_PUBLIC_URL}/${convertSnakeToKebab(
              props.type
            )}/${props.slug}/section/introduction`}
          >
            Mulai
          </Link>
        </Button>
      </div>
    </div>
  );
};

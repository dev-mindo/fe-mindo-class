"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

export const ListVideo = () => {
  const [videoList, setVideoList] = useState<[]>([]);

  const fetchListVideo = async () => {
    const getListVideoBunny = await fetch(
      `https://video.bunnycdn.com/library/361202/videos?page=1&itemsPerPage=10&orderBy=date`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          AccessKey: "a6fd3f68-f0a7-4e0a-8e52f27607bb-58cb-4937",
        },
      }
    );

    const data = await getListVideoBunny.json();

    setVideoList(data.items || []);

    console.log(data.items);
  };

  useEffect(() => {
    fetchListVideo();
  }, []);

  return (
    <div>
      <Input>
      </Input>
      <Table className="w-full">
        <TableCaption>List Video</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>id video</TableHead>
            <TableHead>Nama Video</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videoList?.map((videoItem: any) => (
            <TableRow>
              <TableCell>{videoItem.guid}</TableCell>
              <TableCell>{videoItem.title}</TableCell>
              {/* <TableCell>{item.productType}</TableCell>
                <TableCell>{item._count.sections}</TableCell> */}
              {/* dataClassModule */}
              {/* <TableCell>{item.totalModule}</TableCell> */}
              <TableCell className="flex gap-3">
                {/* <Button className="bg-yellow-500" asChild> */}
                {/* <Link href={`/dashboard/module/${item.id}`}>Edit</Link> */}
                {/* </Button> */}
                <Button>Preview</Button>
                <Button className="bg-red-500">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>      
    </div>
  );
};

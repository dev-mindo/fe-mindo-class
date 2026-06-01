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
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type BunnyVideo = {
  guid: string;
  title: string;
};

type BunnyVideoResponse = {
  items?: BunnyVideo[];
  totalItems?: number;
  currentPage?: number;
  itemsPerPage?: number;
};

const ITEMS_PER_PAGE = 10;

export const ListVideo = () => {
  const [videoList, setVideoList] = useState<BunnyVideo[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchListVideo = async () => {
    setIsLoading(true);
    try {
      const getListVideoBunny = await fetch(
        `https://video.bunnycdn.com/library/361202/videos?page=${currentPage}&itemsPerPage=${ITEMS_PER_PAGE}&orderBy=date`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            AccessKey: "a6fd3f68-f0a7-4e0a-8e52f27607bb-58cb-4937",
          },
        }
      );

      const data: BunnyVideoResponse = await getListVideoBunny.json();

      setVideoList(data.items || []);
      setTotalItems(data.totalItems || 0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListVideo();
  }, [currentPage]);

  const totalPage = Math.max(Math.ceil(totalItems / ITEMS_PER_PAGE), 1);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
  const paginationPages = Array.from({ length: totalPage }, (_, index) => index + 1)
    .filter((page) => {
      return (
        page === 1 ||
        page === totalPage ||
        Math.abs(page - currentPage) <= 1
      );
    });

  return (
    <div>
      <Input placeholder="Cari Video"></Input>
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat video
                </div>
              </TableCell>
            </TableRow>
          ) : null}
          {!isLoading && videoList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                Belum ada video
              </TableCell>
            </TableRow>
          ) : null}
          {!isLoading && videoList?.map((videoItem) => (
            <TableRow key={videoItem.guid}>
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
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Menampilkan {startItem}-{endItem} dari {totalItems} video
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={currentPage === 1 || isLoading}
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            size="icon"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {paginationPages.map((page, index) => {
            const previousPage = paginationPages[index - 1];
            const showSeparator = previousPage && page - previousPage > 1;

            return (
              <div key={page} className="flex items-center gap-2">
                {showSeparator ? (
                  <span className="px-1 text-sm text-muted-foreground">...</span>
                ) : null}
                <Button
                  disabled={isLoading}
                  onClick={() => setCurrentPage(page)}
                  size="sm"
                  variant={currentPage === page ? "default" : "outline"}
                >
                  {page}
                </Button>
              </div>
            );
          })}
          <Button
            disabled={currentPage === totalPage || isLoading}
            onClick={() =>
              setCurrentPage((page) => Math.min(page + 1, totalPage))
            }
            size="icon"
            variant="outline"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

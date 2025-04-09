import { Badge } from "@/components/ui/badge";
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
import { MessageSquare, Search, ThumbsDown, ThumbsUp } from "lucide-react";

export const Discussion = () => {
  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex gap-5">
          <div className="flex items-center gap-2 w-full">
            <Search />
            <Input placeholder="Search Discussion" />
          </div>
          <div>
            <Button>New Discussion</Button>
          </div>
        </div>
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-full"></TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <div>
                  <p className="text-base mb-2">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry.
                  </p>
                  <div className="text-small">Kamis 3 April 2025 - Ivan</div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center gap-5">
                  <Badge>Open</Badge>
                  <div className="flex items-center">
                    <ThumbsUp size={20} />
                    <p className="ml-2 text-base">5</p>
                  </div>
                  <div className="flex items-center">
                    <ThumbsDown size={20}/>
                    <p className="ml-2 text-base">5</p>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare size={20}/>
                    <p className="ml-2 text-base">5</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  );
};

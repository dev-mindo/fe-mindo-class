import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Page = () => {
  return (
    <div className="w-full">
      <h1>Video Learning</h1>
      <div>
        <div>
          <Button>Add Video Learning</Button>
        </div>
        <Table className="w-full">
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Total Peserta</TableHead>
              <TableHead>Method</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Sistem Manajemen</TableCell>
              <TableCell>2</TableCell>
              <TableCell>Credit Card</TableCell>
              <TableCell className="max-w-fit flex items-center gap-2">
                <Button>Detail</Button>
                <Button>Edit</Button>
                <Button>Delete</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Page;

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Info, Terminal } from "lucide-react";

const Page = () => {
  return (
    <div>
      <div className="w-full">
        <div className="mx-auto w-[80%]">
          <h1>Attemp Quiz Pretest Pengetahuan Node JS</h1>
          <div className="mt-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Info</AlertTitle>
              <AlertDescription>
                Soal Berjumlah 5 soal dengan waktu 10 menit
              </AlertDescription>
            </Alert>
            <Table className="my-4">
              {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
              <TableHeader>
                <TableRow>
                  <TableHead>Jumlah Percobaan Quiz</TableHead>
                  <TableHead>Total Benar</TableHead>
                  <TableHead>Total Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Percobaan ke 1</TableCell>
                  <TableCell>4</TableCell>
                  <TableCell>80</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="flex justify-center">
              <div className="my-2">
                <Button>Mulai Quiz</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

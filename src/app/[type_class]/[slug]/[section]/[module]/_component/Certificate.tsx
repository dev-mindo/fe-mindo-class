import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const Certificate = () => {
  return (
    <>
      <div className="mx-auto w-[80%]">
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Info</AlertTitle>
          <AlertDescription className="text-green-500 text-lg">
            Kamu telah berhasil menyelesaikan video learning, sertifikat akan
            dikirimkan ke email kamu
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
};

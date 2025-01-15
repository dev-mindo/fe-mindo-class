import IInput from "@/components/base/IInput";
import ISelect from "@/components/base/ISelect";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

const productOption = [
  {
    value: "1",
    name: "Sistem Manajemen Laboratorium berdasarkan ISO/IEC 17025:2017 Batch 33",
  },
  {
    value: "2",
    name: "HACCP, VACCP, and TACCP based on FSSC 22000 6.0 Version - 22 Februari 2024",
  },
  {
    value: "3",
    name: "Application and Design Product by R&D in Food Industry - 22 Februari 2025",
  },
];

type Props = {
  setProductId: (productId: string) => void;
};

const CreateVideoLearning = (props: Props) => {
  const form = useForm({
    defaultValues: {
      product: "",
    },
  });

  useEffect(() => {}, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Learning</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form action="">
            <div className="flex flex-col gap-4">
              <ISelect
                label="Product"
                control={form.control}
                name="product"
                options={productOption.map((item) => ({
                  value: item.value,
                  label: item.name,
                }))}
              ></ISelect>
              <IInput
                name="title"
                control={form.control}
                label="Upload Video"
                type="file"
              ></IInput>
              <IInput
                name="title"
                control={form.control}
                label="Upload Materi"
                type="file"
              ></IInput>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button>Simpan</Button>
      </CardFooter>
    </Card>
  );
};

export default CreateVideoLearning;

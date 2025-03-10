"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import ISelect from "../base/ISelect";
import ISwitch from "../base/ISwitch";
import { Label } from "@radix-ui/react-label";
import { Button } from "../ui/button";

type Props = {
  title: string;
  productId: string;
};

const hoursOption = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString(),
  label: i.toString(),
}));

const minutesOption = Array.from({ length: 60 }, (_, i) => ({
  value: i.toString(),
  label: i.toString(),
}));

const ManageQuiz = (props: Props) => {
  const form = useForm({
    defaultValues: {
      timeLimit: {
        hours: 0,
        minutes: 0,
      },
      pagination: true,
      publish: true,
      random: true,
    },
  });  

  return (
    <Card>
      <Form {...form}>
        <form action="">
          <CardHeader>
            <CardTitle>{props.title}</CardTitle>
            {/* <CardDescription>Card Description</CardDescription> */}
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div>
                Time Limit
                <div className="flex items-center">
                  <ISelect
                    control={form.control}
                    name="timeLimit.hours"
                    placeholder="0"
                    options={hoursOption.map((item) => ({
                      value: item.value,
                      label: item.label,
                    }))}
                  ></ISelect>
                  <span className="mx-2"> : </span>
                  <ISelect
                    control={form.control}
                    name="timeLimit.minutes"
                    placeholder="0"
                    options={minutesOption.map((item) => ({
                      value: item.value,
                      label: item.label,
                    }))}
                  ></ISelect>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Label>Pagination</Label>
                <ISwitch control={form.control} name="pagination" />
              </div>
              <div className="flex items-center gap-4">
                <Label>Publish</Label>
                <ISwitch control={form.control} name="publish" />
              </div>
              <div className="flex items-center gap-4">
                <Label>Random</Label>
                <ISwitch control={form.control} name="random" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button>Detail</Button>
            <Button>Simpan</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ManageQuiz;

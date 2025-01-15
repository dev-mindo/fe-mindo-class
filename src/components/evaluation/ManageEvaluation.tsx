import { Form, useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

const ManageEvaluation = () => {
  const form = useForm({
    defaultValues: {
      product: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluation</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form action=""></form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ManageEvaluation;

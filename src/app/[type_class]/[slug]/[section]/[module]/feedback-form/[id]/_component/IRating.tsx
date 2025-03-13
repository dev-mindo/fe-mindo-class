import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect } from "react";

type Props = {
  control: any;
  name: string;
};

export const IRating = ({ control, name }: Props) => {
  useEffect(() => {
    console.log();
  }, []);
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3 w-[80%] mx-auto my-4">
          {/* <FormLabel>Notify me about...</FormLabel> */}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex justify-between w-full"
            >
              {Array.from({ length: 5 }, (_, i) => i + 1).map((i) => (
                <FormItem
                  key={i}
                  className="flex flex-col items-center space-x-0 space-y-3"
                >
                  <FormLabel
                    htmlFor={name + i}
                    className={`${
                      parseInt(field.value) === i
                        ? "border-primary"
                        : "border-input"
                    } text-xl p-1 border-2  cursor-pointer rounded-full`}
                  >
                    <div
                      className={`${
                        parseInt(field.value) === i ? "bg-primary" : ""
                      } px-4 py-2 rounded-full`}
                    >
                      {i}
                    </div>
                  </FormLabel>
                  <FormControl>
                    <RadioGroupItem
                      className="hidden"
                      value={i.toString()}
                      id={name + i}
                    />
                  </FormControl>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

import Link from "next/link";
import { Checkbox } from "../ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

type Props = {
  control: any;
  name: string;
  description?: string;
  items: {
    id: string | number
    label: string
  }[]
};

const ICheckbox = ({ control, name, description, items }: Props) => {
  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          {/* <div className="mb-4">
            <FormLabel className="text-base">Sidebar</FormLabel>
            <FormDescription>
              Select the items you want to display in the sidebar.
            </FormDescription>
          </div> */}
          {items.map((item) => (
            <FormField
              key={item.id}
              control={control}
              name={name}
              render={({ field }) => {
                return (
                  <FormItem
                    key={item.id}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(item.id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...field.value, item.id])
                            : field.onChange(
                                field.value?.filter(
                                  (value: any) => value !== item.id
                                )
                              );
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      {item.label}
                    </FormLabel>
                  </FormItem>
                );
              }}
            />
          ))}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ICheckbox;

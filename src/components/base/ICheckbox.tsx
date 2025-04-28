import { Checkbox } from "../ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useState } from "react";

type Props = {
  control: any;
  name: string;
  description?: string;
  items: {
    id: string | number;
    label: string;
  }[];
};

const ICheckbox = ({ control, name, items }: Props) => {
  const [otherInput, setOtherInput] = useState("");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {items.map((item) => {
            const isOther = item.id === "other";
            const isChecked = field.value?.includes(item.id);

            return (
              <div key={item.id} className="flex flex-col space-y-2">
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        let newValue = [...(field.value || [])];

                        if (checked) {
                          newValue.push(item.id);
                          // Kalau "other" dicentang dan sudah ada input, sekalian masukkan ke array
                          if (isOther && otherInput.trim()) {
                            newValue.push(otherInput.trim());
                          }
                        } else {
                          // Hilangkan "other" dan input textnya juga
                          newValue = newValue.filter(
                            (v) => v !== item.id && v !== otherInput.trim()
                          );
                        }

                        field.onChange(newValue);
                      }}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {isOther ? "Lainnya" : item.label}
                  </FormLabel>
                </FormItem>

                {isOther && isChecked && (
                  <Input
                    value={otherInput}
                    placeholder="Tulis jawaban lainnya..."
                    onChange={(e) => {
                      const text = e.target.value;
                      setOtherInput(text);

                      // Update field.value juga saat mengetik
                      let newValue = [...(field.value || [])];

                      // Hapus old input kalau ada
                      newValue = newValue.filter(
                        (v) => v !== otherInput.trim()
                      );

                      if (text.trim()) {
                        newValue.push(text.trim());
                      }

                      field.onChange(newValue);
                    }}
                  />
                )}
              </div>
            );
          })}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ICheckbox;

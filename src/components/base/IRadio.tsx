import { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type RadioProps = {
  control: any;
  name: string;
  label?: string;
  items: {
    id: string | number;
    label: string;
  }[];
};

const IRadio = ({ control, name, items, label }: RadioProps) => {
  const [isOther, setIsOther] = useState<boolean>(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(e) => {
                if (e === "other") {
                  setIsOther(true);
                } else {
                  setIsOther(false);
                  field.onChange(e);
                }
              }}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              {items.map((item) => (
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={item.id.toString()} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {item.label === "other" ? (
                      <div className="flex items-center gap-3">
                        Other 
                        <Input
                          disabled={!isOther}
                          onChange={(e) => {
                            if (isOther) {
                              field.onChange(e.target.value);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      item.label
                    )}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default IRadio;

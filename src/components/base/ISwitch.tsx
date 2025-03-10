import { Control } from "react-hook-form";
import {
  FormControl,  
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { Switch } from "../ui/switch";

type Props = {
  control: Control<any>;
  name: string;
  label?: string;
};

const ISwitch = (props: Props) => {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{props.label}</FormLabel>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default ISwitch;

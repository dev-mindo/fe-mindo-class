import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

type Props = {
  dataChart: {
    trial: number;
    score: number;
  }[];
};

export const ChartAttemptQuiz = ({dataChart}: Props) => {
  return (
    <ChartContainer
      config={{
        trial: {
          label: "Trial",
          color: "hsl(var(--chart-1))",
        }
      }}
    >
      <AreaChart
        accessibilityLayer
        data={dataChart}
        margin={{
          left: 10,
          right: 10,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="score"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Area
          dataKey="score"
          type="natural"
          fill="var(--color-trial)"
          fillOpacity={0.4}
          stroke="var(--color-trial)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
};

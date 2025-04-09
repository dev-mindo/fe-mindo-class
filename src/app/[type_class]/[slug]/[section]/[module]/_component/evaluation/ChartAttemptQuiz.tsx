import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

type Props = {
  dataChart: {
    trial: number;
    score: number;
    groupTitle: string;
  }[];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const { score, groupTitle } = payload[0].payload;
    return (
      <div className="bg-white dark:bg-zinc-900 border rounded-lg p-2 shadow">
        {/* <p className="text-sm font-semibold">Percobaan ke-{label}</p> */}
        <p className="text-sm">Skor: {score}</p>
        <p className="text-xs text-muted-foreground">{groupTitle}</p>
      </div>
    );
  }
  return null;
};

export const ChartAttemptQuiz = ({ dataChart }: Props) => {
  return (
    <ChartContainer
      config={{
        score: {
          label: "Skor",
          color: "hsl(var(--chart-1))",
        },
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
          tickFormatter={(value) => {            
            return `${value}`
          }}
        />
        <ChartTooltip
          cursor={false}
          content={<CustomTooltip />}
        />
        <Area
          dataKey="score"
          type="natural"
          fill="var(--color-score)"
          fillOpacity={0.4}
          stroke="var(--color-score)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
};

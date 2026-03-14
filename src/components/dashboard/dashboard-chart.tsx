"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartDataPoint {
  date: string;
  transactions: number;
}

const chartConfig = {
  transactions: {
    label: "Transactions",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

interface DashboardChartProps {
  title?: string;
  description?: string;
}

export default function DashboardChart({
  title = "Transaction Activity",
  description = "Daily transaction volume (last 30 days)",
}: DashboardChartProps) {
  const [data, setData] = React.useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchChartData() {
      try {
        const res = await fetch("/api/dashboard/chart-data");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch chart data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchChartData();
  }, []);

  const total = data.reduce((acc, curr) => acc + curr.transactions, 0);

  return (
    <Card className="@container/card w-full">
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {loading
            ? "Loading chart data..."
            : `${total.toLocaleString()} total transactions in the last 30 days`}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pt-4">
        {loading ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
            Loading...
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[160px]"
                    nameKey="transactions"
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                  />
                }
              />
              <Bar
                dataKey="transactions"
                fill="var(--color-transactions)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

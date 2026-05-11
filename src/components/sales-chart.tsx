
'use client';

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Area, AreaChart, Pie, PieChart, Cell } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SalesData } from '@/ai/flows/get-sales-data-flow';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const pieChartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

type ChartType = 'bar' | 'line' | 'area' | 'pie';

export type SalesChartProps = {
  chartData: SalesData[];
  onTimeRangeChange: (value: string) => void;
  loading: boolean;
  initialTimeRange: string;
};

export function SalesChart({ chartData, onTimeRangeChange, loading, initialTimeRange }: SalesChartProps) {
  const [chartType, setChartType] = useState<ChartType>('bar');
  
  const handleChartTypeChange = (value: string) => {
    setChartType(value as ChartType);
  };

  const renderChart = () => {
    switch(chartType) {
      case 'pie':
        return (
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [`₹${(value as number).toLocaleString('en-IN')}`, name]}
                  nameKey="date"
                />
              }
            />
            <Pie data={chartData} dataKey="sales" nameKey="date" cx="50%" cy="50%" outerRadius={120} >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
              ))}
            </Pie>
          </PieChart>
        )
      case 'area':
        return (
          <AreaChart data={chartData}>
             <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => `₹${value / 1000}k`}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => `₹${(value as number).toLocaleString('en-IN')}`}
                />
              }
            />
            <Area type="monotone" dataKey="sales" fill="var(--color-sales)" stroke="var(--color-sales)" fillOpacity={0.4} />
          </AreaChart>
        )
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => `₹${value / 1000}k`}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => `₹${(value as number).toLocaleString('en-IN')}`}
                />
              }
            />
            <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} dot={false} />
          </LineChart>
        )
      case 'bar':
      default:
        return (
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => `₹${value / 1000}k`}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => `₹${(value as number).toLocaleString('en-IN')}`}
                />
              }
            />
            <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
          </BarChart>
        )
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2">
        <Select onValueChange={handleChartTypeChange} defaultValue="bar">
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Bar</SelectItem>
            <SelectItem value="line">Line</SelectItem>
            <SelectItem value="area">Area</SelectItem>
            <SelectItem value="pie">Pie</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={onTimeRangeChange} defaultValue={initialTimeRange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {loading ? (
        <Skeleton className="h-[350px] w-full" />
      ) : (
        <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
         {renderChart()}
        </ChartContainer>
      )}
    </div>
  );
}

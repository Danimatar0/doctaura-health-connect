/**
 * Height/Weight Chart Component
 *
 * Displays height, weight, and BMI trends over time using line charts.
 * Includes BMI category indicators and reference zones.
 */

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Scale, Plus, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { HeightWeightReading } from '@/types/healthProfile.types';

interface HeightWeightChartProps {
  data: HeightWeightReading[];
  onAddReading: () => void;
  isLoading?: boolean;
}

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

const chartConfig = {
  weight: {
    label: 'Weight (kg)',
    color: 'hsl(var(--primary))',
  },
  bmi: {
    label: 'BMI',
    color: 'hsl(var(--secondary))',
  },
};

// BMI Categories
const getBmiCategory = (bmi: number): { label: string; color: string } => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
  if (bmi < 25) return { label: 'Normal', color: 'text-green-600' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600' };
  return { label: 'Obese', color: 'text-red-600' };
};

const HeightWeightChart = ({
  data,
  onAddReading,
  isLoading = false,
}: HeightWeightChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('90d');
  const [showBmi, setShowBmi] = useState(true);

  // Filter data by time range
  const filteredData = useMemo(() => {
    const now = new Date();
    let cutoffDate: Date;

    switch (timeRange) {
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(0);
    }

    return data
      .filter((reading) => new Date(reading.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((reading) => ({
        ...reading,
        dateFormatted: new Date(reading.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      }));
  }, [data, timeRange]);

  // Calculate stats
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;

    const latestWeight = filteredData[filteredData.length - 1]?.weight;
    const firstWeight = filteredData[0]?.weight;
    const latestBmi = filteredData[filteredData.length - 1]?.bmi;
    const latestHeight = filteredData[filteredData.length - 1]?.height;

    const weightChange = latestWeight && firstWeight ? latestWeight - firstWeight : null;

    return {
      latestWeight,
      latestBmi,
      latestHeight,
      weightChange,
    };
  }, [filteredData]);

  const formatXAxis = (value: string) => value;
  const formatYAxis = (value: number) => `${value}`;

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Weight & BMI Tracking
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddReading}
              disabled={isLoading}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t">
            {stats.latestWeight && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Current Weight:</span>
                <span className="font-bold text-lg">{stats.latestWeight} kg</span>
                {stats.weightChange !== null && stats.weightChange !== 0 && (
                  <Badge
                    variant="outline"
                    className={
                      stats.weightChange < 0
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-orange-500/10 text-orange-600'
                    }
                  >
                    {stats.weightChange < 0 ? (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    )}
                    {stats.weightChange > 0 ? '+' : ''}
                    {stats.weightChange.toFixed(1)} kg
                  </Badge>
                )}
              </div>
            )}
            {stats.latestBmi && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">BMI:</span>
                <span className="font-bold">{stats.latestBmi.toFixed(1)}</span>
                <Badge
                  variant="outline"
                  className={getBmiCategory(stats.latestBmi).color}
                >
                  {getBmiCategory(stats.latestBmi).label}
                </Badge>
              </div>
            )}
            {stats.latestHeight && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Height:</span>
                <span className="font-medium">{stats.latestHeight} cm</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Scale className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No weight data recorded</p>
            <p className="text-xs mt-1">Add your first reading to start tracking</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Toggle BMI */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBmi(!showBmi)}
                className="text-xs"
              >
                {showBmi ? 'Hide' : 'Show'} BMI Line
              </Button>
            </div>

            {/* Chart */}
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="dateFormatted"
                    tickFormatter={formatXAxis}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    yAxisId="weight"
                    orientation="left"
                    tickFormatter={formatYAxis}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  {showBmi && (
                    <YAxis
                      yAxisId="bmi"
                      orientation="right"
                      tickFormatter={formatYAxis}
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      domain={[15, 40]}
                    />
                  )}
                  <ChartTooltip content={<ChartTooltipContent />} />

                  {/* BMI Reference Lines */}
                  {showBmi && (
                    <>
                      <ReferenceLine
                        yAxisId="bmi"
                        y={18.5}
                        stroke="hsl(var(--muted-foreground))"
                        strokeDasharray="5 5"
                        strokeOpacity={0.5}
                      />
                      <ReferenceLine
                        yAxisId="bmi"
                        y={25}
                        stroke="hsl(var(--muted-foreground))"
                        strokeDasharray="5 5"
                        strokeOpacity={0.5}
                      />
                      <ReferenceLine
                        yAxisId="bmi"
                        y={30}
                        stroke="hsl(var(--muted-foreground))"
                        strokeDasharray="5 5"
                        strokeOpacity={0.5}
                      />
                    </>
                  )}

                  <Line
                    yAxisId="weight"
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--color-weight)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-weight)', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    name="Weight (kg)"
                  />
                  {showBmi && (
                    <Line
                      yAxisId="bmi"
                      type="monotone"
                      dataKey="bmi"
                      stroke="var(--color-bmi)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: 'var(--color-bmi)', strokeWidth: 2 }}
                      name="BMI"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* BMI Legend */}
            {showBmi && (
              <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Underweight (&lt;18.5)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Normal (18.5-25)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  Overweight (25-30)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Obese (&gt;30)
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HeightWeightChart;

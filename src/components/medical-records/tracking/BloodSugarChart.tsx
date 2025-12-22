/**
 * Blood Sugar Chart Component
 *
 * Displays blood glucose trends with measurement type differentiation.
 * Includes reference ranges for diabetic monitoring.
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
  Scatter,
  ScatterChart,
  ZAxis,
} from 'recharts';
import { Droplets, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import type { BloodSugarReading, BloodSugarCategory, BloodSugarMeasurementType } from '@/types/healthProfile.types';
import { getBloodSugarCategory, BLOOD_SUGAR_MEASUREMENT_LABELS } from '@/types/healthProfile.types';

interface BloodSugarChartProps {
  data: BloodSugarReading[];
  onAddReading: () => void;
  isLoading?: boolean;
}

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

const chartConfig = {
  fasting: {
    label: 'Fasting',
    color: 'hsl(217, 91%, 60%)', // Blue
  },
  'post-meal': {
    label: 'Post-Meal',
    color: 'hsl(25, 95%, 53%)', // Orange
  },
  random: {
    label: 'Random',
    color: 'hsl(142, 71%, 45%)', // Green
  },
  bedtime: {
    label: 'Bedtime',
    color: 'hsl(262, 83%, 58%)', // Purple
  },
};

const getCategoryInfo = (category: BloodSugarCategory): { label: string; color: string } => {
  switch (category) {
    case 'normal':
      return { label: 'Normal', color: 'bg-green-500/10 text-green-600' };
    case 'prediabetic':
      return { label: 'Pre-diabetic', color: 'bg-yellow-500/10 text-yellow-600' };
    case 'diabetic':
      return { label: 'Diabetic Range', color: 'bg-red-500/10 text-red-600' };
    default:
      return { label: 'Unknown', color: 'bg-gray-500/10 text-gray-600' };
  }
};

const getMeasurementColor = (type: BloodSugarMeasurementType): string => {
  switch (type) {
    case 'fasting':
      return 'hsl(217, 91%, 60%)';
    case 'post-meal':
      return 'hsl(25, 95%, 53%)';
    case 'random':
      return 'hsl(142, 71%, 45%)';
    case 'bedtime':
      return 'hsl(262, 83%, 58%)';
    default:
      return 'hsl(var(--primary))';
  }
};

const BloodSugarChart = ({
  data,
  onAddReading,
  isLoading = false,
}: BloodSugarChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [measurementFilter, setMeasurementFilter] = useState<BloodSugarMeasurementType | 'all'>('all');

  // Filter data by time range and measurement type
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
      .filter((reading) => measurementFilter === 'all' || reading.measurementType === measurementFilter)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((reading) => ({
        ...reading,
        dateFormatted: new Date(reading.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        color: getMeasurementColor(reading.measurementType),
      }));
  }, [data, timeRange, measurementFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;

    const latest = filteredData[filteredData.length - 1];
    const first = filteredData[0];

    // Calculate averages by type
    const fastingReadings = filteredData.filter(r => r.measurementType === 'fasting');
    const avgFasting = fastingReadings.length > 0
      ? Math.round(fastingReadings.reduce((sum, r) => sum + r.value, 0) / fastingReadings.length)
      : null;

    const postMealReadings = filteredData.filter(r => r.measurementType === 'post-meal');
    const avgPostMeal = postMealReadings.length > 0
      ? Math.round(postMealReadings.reduce((sum, r) => sum + r.value, 0) / postMealReadings.length)
      : null;

    const overallAvg = Math.round(
      filteredData.reduce((sum, r) => sum + r.value, 0) / filteredData.length
    );

    const valueChange = latest.value - first.value;
    const category = getBloodSugarCategory(latest.value, latest.measurementType, latest.unit);

    return {
      latestValue: latest.value,
      latestUnit: latest.unit,
      latestType: latest.measurementType,
      avgFasting,
      avgPostMeal,
      overallAvg,
      valueChange,
      category,
    };
  }, [filteredData]);

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Droplets className="h-5 w-5 text-amber-500" />
            Blood Sugar
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={measurementFilter} onValueChange={(v) => setMeasurementFilter(v as BloodSugarMeasurementType | 'all')}>
              <SelectTrigger className="w-[110px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="fasting">Fasting</SelectItem>
                <SelectItem value="post-meal">Post-Meal</SelectItem>
                <SelectItem value="random">Random</SelectItem>
                <SelectItem value="bedtime">Bedtime</SelectItem>
              </SelectContent>
            </Select>
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Latest:</span>
              <span className="font-bold text-lg">{stats.latestValue}</span>
              <span className="text-sm text-muted-foreground">{stats.latestUnit}</span>
              <Badge
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: getMeasurementColor(stats.latestType) + '20', color: getMeasurementColor(stats.latestType) }}
              >
                {BLOOD_SUGAR_MEASUREMENT_LABELS[stats.latestType]}
              </Badge>
              <Badge variant="outline" className={getCategoryInfo(stats.category).color}>
                {getCategoryInfo(stats.category).label}
              </Badge>
            </div>
            {stats.avgFasting && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Avg Fasting:</span>
                <span className="font-medium">{stats.avgFasting} {stats.latestUnit}</span>
              </div>
            )}
            {stats.avgPostMeal && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Avg Post-Meal:</span>
                <span className="font-medium">{stats.avgPostMeal} {stats.latestUnit}</span>
              </div>
            )}
            {stats.valueChange !== 0 && (
              <Badge
                variant="outline"
                className={
                  stats.valueChange < 0
                    ? 'bg-green-500/10 text-green-600'
                    : 'bg-orange-500/10 text-orange-600'
                }
              >
                {stats.valueChange < 0 ? (
                  <TrendingDown className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingUp className="h-3 w-3 mr-1" />
                )}
                {stats.valueChange > 0 ? '+' : ''}
                {stats.valueChange} {stats.latestUnit}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Droplets className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No blood sugar data recorded</p>
            <p className="text-xs mt-1">Add your first reading to start tracking</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart */}
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

                  {/* Reference lines for normal ranges */}
                  <ReferenceLine
                    y={70}
                    stroke="hsl(217, 91%, 60%)"
                    strokeDasharray="5 5"
                    strokeOpacity={0.5}
                    label={{ value: 'Low', position: 'insideTopLeft', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ReferenceLine
                    y={100}
                    stroke="hsl(142, 71%, 45%)"
                    strokeDasharray="5 5"
                    strokeOpacity={0.5}
                    label={{ value: 'Normal Fasting Max', position: 'insideTopLeft', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ReferenceLine
                    y={140}
                    stroke="hsl(47, 96%, 53%)"
                    strokeDasharray="5 5"
                    strokeOpacity={0.5}
                    label={{ value: 'Post-Meal Target', position: 'insideTopLeft', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ReferenceLine
                    y={180}
                    stroke="hsl(0, 84%, 60%)"
                    strokeDasharray="5 5"
                    strokeOpacity={0.5}
                    label={{ value: 'High', position: 'insideTopLeft', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />

                  <XAxis
                    dataKey="dateFormatted"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    domain={[50, 250]}
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as BloodSugarReading & { dateFormatted: string };
                        return (
                          <div className="bg-background border rounded-lg shadow-lg p-3">
                            <p className="font-medium">{data.dateFormatted}</p>
                            <p className="text-lg font-bold">
                              {data.value} {data.unit}
                            </p>
                            <Badge
                              variant="secondary"
                              className="text-xs mt-1"
                              style={{ backgroundColor: getMeasurementColor(data.measurementType) + '20', color: getMeasurementColor(data.measurementType) }}
                            >
                              {BLOOD_SUGAR_MEASUREMENT_LABELS[data.measurementType]}
                            </Badge>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={({ cx, cy, payload }: { cx: number; cy: number; payload: BloodSugarReading }) => (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill={getMeasurementColor(payload.measurementType)}
                        stroke="white"
                        strokeWidth={2}
                      />
                    )}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-2 border-t">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getMeasurementColor('fasting') }}></span>
                Fasting
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getMeasurementColor('post-meal') }}></span>
                Post-Meal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getMeasurementColor('random') }}></span>
                Random
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getMeasurementColor('bedtime') }}></span>
                Bedtime
              </span>
              <span className="text-muted-foreground/60">|</span>
              <span>Target: 70-100 (fasting)</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BloodSugarChart;

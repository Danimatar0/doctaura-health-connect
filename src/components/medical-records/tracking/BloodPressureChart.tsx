/**
 * Blood Pressure Chart Component
 *
 * Displays systolic and diastolic blood pressure trends.
 * Includes BP category indicators and reference zones.
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
  ReferenceArea,
} from 'recharts';
import { Heart, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import type { BloodPressureReading, BloodPressureCategory } from '@/types/healthProfile.types';
import { getBloodPressureCategory } from '@/types/healthProfile.types';

interface BloodPressureChartProps {
  data: BloodPressureReading[];
  onAddReading: () => void;
  isLoading?: boolean;
}

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

const chartConfig = {
  systolic: {
    label: 'Systolic',
    color: 'hsl(0, 84%, 60%)', // Red
  },
  diastolic: {
    label: 'Diastolic',
    color: 'hsl(217, 91%, 60%)', // Blue
  },
  pulse: {
    label: 'Pulse',
    color: 'hsl(142, 71%, 45%)', // Green
  },
};

const getCategoryInfo = (category: BloodPressureCategory): { label: string; color: string } => {
  switch (category) {
    case 'normal':
      return { label: 'Normal', color: 'bg-green-500/10 text-green-600' };
    case 'elevated':
      return { label: 'Elevated', color: 'bg-yellow-500/10 text-yellow-600' };
    case 'high-stage-1':
      return { label: 'High (Stage 1)', color: 'bg-orange-500/10 text-orange-600' };
    case 'high-stage-2':
      return { label: 'High (Stage 2)', color: 'bg-red-500/10 text-red-600' };
    case 'crisis':
      return { label: 'Crisis', color: 'bg-red-700/10 text-red-700' };
    default:
      return { label: 'Unknown', color: 'bg-gray-500/10 text-gray-600' };
  }
};

const BloodPressureChart = ({
  data,
  onAddReading,
  isLoading = false,
}: BloodPressureChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [showPulse, setShowPulse] = useState(false);

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

    const latest = filteredData[filteredData.length - 1];
    const first = filteredData[0];

    const avgSystolic = Math.round(
      filteredData.reduce((sum, r) => sum + r.systolic, 0) / filteredData.length
    );
    const avgDiastolic = Math.round(
      filteredData.reduce((sum, r) => sum + r.diastolic, 0) / filteredData.length
    );

    const systolicChange = latest.systolic - first.systolic;
    const category = getBloodPressureCategory(latest.systolic, latest.diastolic);

    return {
      latestSystolic: latest.systolic,
      latestDiastolic: latest.diastolic,
      latestPulse: latest.pulse,
      avgSystolic,
      avgDiastolic,
      systolicChange,
      category,
    };
  }, [filteredData]);

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Blood Pressure
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Latest:</span>
              <span className="font-bold text-lg">
                {stats.latestSystolic}/{stats.latestDiastolic}
              </span>
              <span className="text-sm text-muted-foreground">mmHg</span>
              <Badge variant="outline" className={getCategoryInfo(stats.category).color}>
                {getCategoryInfo(stats.category).label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Avg:</span>
              <span className="font-medium">
                {stats.avgSystolic}/{stats.avgDiastolic}
              </span>
            </div>
            {stats.latestPulse && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Pulse:</span>
                <span className="font-medium">{stats.latestPulse} bpm</span>
              </div>
            )}
            {stats.systolicChange !== 0 && (
              <Badge
                variant="outline"
                className={
                  stats.systolicChange < 0
                    ? 'bg-green-500/10 text-green-600'
                    : 'bg-orange-500/10 text-orange-600'
                }
              >
                {stats.systolicChange < 0 ? (
                  <TrendingDown className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingUp className="h-3 w-3 mr-1" />
                )}
                {stats.systolicChange > 0 ? '+' : ''}
                {stats.systolicChange} systolic
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No blood pressure data recorded</p>
            <p className="text-xs mt-1">Add your first reading to start tracking</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Toggle Pulse */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPulse(!showPulse)}
                className="text-xs"
              >
                {showPulse ? 'Hide' : 'Show'} Pulse
              </Button>
            </div>

            {/* Chart */}
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

                  {/* Reference areas for BP zones */}
                  <ReferenceArea y1={0} y2={80} fill="hsl(142, 71%, 45%)" fillOpacity={0.05} />
                  <ReferenceArea y1={80} y2={90} fill="hsl(47, 96%, 53%)" fillOpacity={0.05} />
                  <ReferenceArea y1={90} y2={120} fill="hsl(25, 95%, 53%)" fillOpacity={0.05} />
                  <ReferenceArea y1={120} y2={200} fill="hsl(0, 84%, 60%)" fillOpacity={0.05} />

                  <XAxis
                    dataKey="dateFormatted"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    yAxisId="bp"
                    orientation="left"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    domain={[40, 200]}
                  />
                  {showPulse && (
                    <YAxis
                      yAxisId="pulse"
                      orientation="right"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      domain={[40, 120]}
                    />
                  )}
                  <ChartTooltip content={<ChartTooltipContent />} />

                  <Line
                    yAxisId="bp"
                    type="monotone"
                    dataKey="systolic"
                    stroke="var(--color-systolic)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-systolic)', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    name="Systolic"
                  />
                  <Line
                    yAxisId="bp"
                    type="monotone"
                    dataKey="diastolic"
                    stroke="var(--color-diastolic)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-diastolic)', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    name="Diastolic"
                  />
                  {showPulse && (
                    <Line
                      yAxisId="pulse"
                      type="monotone"
                      dataKey="pulse"
                      stroke="var(--color-pulse)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: 'var(--color-pulse)', strokeWidth: 2 }}
                      name="Pulse"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-2 border-t">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-red-500"></span>
                Systolic (top)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-blue-500"></span>
                Diastolic (bottom)
              </span>
              {showPulse && (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-green-500 border-dashed"></span>
                  Pulse
                </span>
              )}
              <span className="text-muted-foreground/60">|</span>
              <span>Normal: &lt;120/80</span>
              <span>High: &gt;130/80</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BloodPressureChart;

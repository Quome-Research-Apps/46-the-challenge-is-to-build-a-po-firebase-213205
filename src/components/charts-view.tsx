'use client';

import { useMemo } from 'react';
import type { PropertySale } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, ZAxis } from 'recharts';
import { format } from 'date-fns';

interface ChartsViewProps {
  data: PropertySale[];
  activeProperty: PropertySale | null;
  onActivePropertyChange: (property: PropertySale | null) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="font-bold">{label}</p>
        {payload.map((p: any, i:number) => (
            <p key={i} style={{ color: p.color }}>{`${p.name}: ${p.value.toLocaleString()}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ChartsView({ data }: ChartsViewProps) {
  const salesByMonth = useMemo(() => {
    const monthlyData: { [key: string]: { volume: number; totalValue: number; count: number } } = {};
    data.forEach(sale => {
      const month = format(sale.saleDate, 'yyyy-MM');
      if (!monthlyData[month]) {
        monthlyData[month] = { volume: 0, totalValue: 0, count: 0 };
      }
      monthlyData[month].volume += sale.price;
      monthlyData[month].totalValue += sale.price;
      monthlyData[month].count++;
    });

    return Object.entries(monthlyData)
      .map(([month, values]) => ({
        month,
        'Sales Volume': values.volume,
        'Average Price': values.totalValue / values.count
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [data]);

  const priceVsSqftData = useMemo(() => {
    return data.map(sale => ({
      sqft: sale.sqft,
      price: sale.price,
      address: sale.address
    }));
  }, [data]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="font-headline">Sales Over Time</CardTitle>
          <CardDescription>Monthly sales volume and average price.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tickFormatter={(str) => format(new Date(str), 'MMM yy')} />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`}/>
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="Sales Volume" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="Average Price" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="font-headline">Price vs. Square Footage</CardTitle>
          <CardDescription>Each point represents a property sale.</CardDescription>
        </CardHeader>
        <CardContent>
           <ResponsiveContainer width="100%" height={250}>
             <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
              <XAxis type="number" dataKey="sqft" name="sqft" unit=" sqft" stroke="hsl(var(--muted-foreground))" tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
              <YAxis type="number" dataKey="price" name="price" unit=" USD" stroke="hsl(var(--muted-foreground))" tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`} />
              <ZAxis type="number" range={[20, 100]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Scatter name="Sales" data={priceVsSqftData} fill="hsl(var(--chart-1))" opacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import type { Filters, PropertySale } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo } from 'react';

interface FiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  data: PropertySale[];
  propertyTypes: string[];
}

export default function FiltersComponent({ filters, onFiltersChange, data, propertyTypes }: FiltersProps) {
  const { minPrice, maxPrice, minSqft, maxSqft } = useMemo(() => {
    if (data.length === 0) return { minPrice: 0, maxPrice: 10000000, minSqft: 0, maxSqft: 10000 };
    const prices = data.map(p => p.price);
    const sqfts = data.map(p => p.sqft);
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      minSqft: Math.min(...sqfts),
      maxSqft: Math.max(...sqfts),
    };
  }, [data]);

  const handlePriceChange = (value: [number, number]) => {
    onFiltersChange({ ...filters, priceRange: value });
  };
  
  const handleSqftChange = (value: [number, number]) => {
    onFiltersChange({ ...filters, sqftRange: value });
  };

  const handlePropertyTypeChange = (value: string) => {
    onFiltersChange({ ...filters, propertyType: value });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }
  
  const formatSqft = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value) + ' sqft';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Filters</CardTitle>
        <CardDescription>Refine the dataset to explore trends.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Price Range</Label>
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceChange}
            min={minPrice}
            max={maxPrice}
            step={1000}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(filters.priceRange[0])}</span>
            <span>{formatCurrency(filters.priceRange[1])}</span>
          </div>
        </div>
        <div className="space-y-3">
          <Label>Square Footage</Label>
           <Slider
            value={filters.sqftRange}
            onValueChange={handleSqftChange}
            min={minSqft}
            max={maxSqft}
            step={10}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatSqft(filters.sqftRange[0])}</span>
            <span>{formatSqft(filters.sqftRange[1])}</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Property Type</Label>
          <Select value={filters.propertyType} onValueChange={handlePropertyTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

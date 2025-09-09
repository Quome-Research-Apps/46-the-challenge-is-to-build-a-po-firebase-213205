'use client';
import { useState, useMemo, useCallback } from 'react';
import type { PropertySale, Filters } from '@/types';
import { Sidebar, SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import Header from './header';
import FileUploader from './file-uploader';
import FiltersComponent from './filters';
import StatisticalSummary from './statistical-summary';
import MapView from './map-view';
import ChartsView from './charts-view';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Logo } from './icons';

const initialFilters: Filters = {
  priceRange: [0, 10000000],
  sqftRange: [0, 10000],
  propertyType: 'all',
};

export default function Dashboard() {
  const [data, setData] = useState<PropertySale[]>([]);
  const [csvString, setCsvString] = useState<string>('');
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [activeProperty, setActiveProperty] = useState<PropertySale | null>(null);

  const onDataUploaded = useCallback((parsedData: PropertySale[], rawCsv: string) => {
    setData(parsedData);
    setCsvString(rawCsv);

    if (parsedData.length > 0) {
      const prices = parsedData.map(p => p.price);
      const sqfts = parsedData.map(p => p.sqft);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const minSqft = Math.min(...sqfts);
      const maxSqft = Math.max(...sqfts);
      setFilters({
        priceRange: [minPrice, maxPrice],
        sqftRange: [minSqft, maxSqft],
        propertyType: 'all',
      });
    }
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const [minPrice, maxPrice] = filters.priceRange;
      const [minSqft, maxSqft] = filters.sqftRange;
      
      const priceMatch = item.price >= minPrice && item.price <= maxPrice;
      const sqftMatch = item.sqft >= minSqft && item.sqft <= maxSqft;
      const typeMatch = filters.propertyType === 'all' || item.propertyType.toLowerCase() === filters.propertyType.toLowerCase();
      
      return priceMatch && sqftMatch && typeMatch;
    });
  }, [data, filters]);

  const uniquePropertyTypes = useMemo(() => {
    const types = new Set(data.map(item => item.propertyType));
    return ['all', ...Array.from(types)];
  }, [data]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Sidebar>
          <div className="flex h-16 items-center border-b px-4">
            <div className="flex items-center gap-2">
              <Logo className="h-6 w-6 text-primary" />
              <h1 className="font-headline text-xl font-semibold">PropVisor</h1>
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="space-y-4 p-4">
              <FileUploader onDataUploaded={onDataUploaded} />
              {data.length > 0 && (
                <>
                  <Separator />
                  <FiltersComponent
                    filters={filters}
                    onFiltersChange={setFilters}
                    data={data}
                    propertyTypes={uniquePropertyTypes}
                  />
                  <Separator />
                  <StatisticalSummary csvData={csvString} />
                </>
              )}
            </div>
          </ScrollArea>
        </Sidebar>

        <SidebarInset>
          <div className="flex flex-1 flex-col">
            <Header />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
              {data.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="font-headline text-2xl font-bold tracking-tight">
                      No Data Uploaded
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload a CSV file in the sidebar to begin your analysis.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <MapView data={filteredData} activeProperty={activeProperty} onActivePropertyChange={setActiveProperty} />
                    </div>
                    <ChartsView data={filteredData} activeProperty={activeProperty} onActivePropertyChange={setActiveProperty}/>
                </div>
              )}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

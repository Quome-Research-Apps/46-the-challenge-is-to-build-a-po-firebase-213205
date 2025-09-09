'use client';

import type { PropertySale } from '@/types';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle } from 'lucide-react';

interface MapViewProps {
  data: PropertySale[];
  activeProperty: PropertySale | null;
  onActivePropertyChange: (property: PropertySale | null) => void;
}

export default function MapView({ data, activeProperty, onActivePropertyChange }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const center = useMemo(() => {
    if (data.length > 0) {
      const avgLat = data.reduce((sum, p) => sum + p.latitude, 0) / data.length;
      const avgLng = data.reduce((sum, p) => sum + p.longitude, 0) / data.length;
      return { lat: avgLat, lng: avgLng };
    }
    return { lat: 39.8283, lng: -98.5795 }; // Default center of US
  }, [data]);

  const priceRange = useMemo(() => {
    if (data.length < 2) return { min: 0, max: 1 };
    const prices = data.map(p => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [data]);

  const getColorForPrice = (price: number) => {
    const { min, max } = priceRange;
    if (max === min) return '#468189'; // Muted Teal (Primary)
    const ratio = (price - min) / (max - min);
    // Interpolate between Teal and Amber
    const r = Math.round(70 + (226 - 70) * ratio);
    const g = Math.round(129 + (215 - 129) * ratio);
    const b = Math.round(137 + (161 - 137) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  };

  if (!apiKey) {
    return (
        <div className="h-full w-full flex items-center justify-center p-4">
            <div className="text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <h3 className="mt-4 font-headline text-lg font-semibold">Map Configuration Error</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Google Maps API key is not configured. Please set the <code className="p-1 bg-muted rounded-sm">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> environment variable.
                </p>
            </div>
        </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        mapId="propvisor_map"
        style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
        defaultCenter={center}
        center={center}
        defaultZoom={data.length > 0 ? 11 : 4}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        {data.map((property) => (
          <AdvancedMarker
            key={property.id}
            position={{ lat: property.latitude, lng: property.longitude }}
            onClick={() => onActivePropertyChange(property)}
          >
             <Pin
                background={getColorForPrice(property.price)}
                borderColor={getColorForPrice(property.price)}
                glyphColor={"#222831"}
             />
          </AdvancedMarker>
        ))}
        {activeProperty && (
            <InfoWindow
                position={{ lat: activeProperty.latitude, lng: activeProperty.longitude }}
                onCloseClick={() => onActivePropertyChange(null)}
                pixelOffset={[0,-35]}
            >
                <div className="p-1 text-foreground">
                    <p className="font-bold">{activeProperty.address}</p>
                    <p>Price: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(activeProperty.price)}</p>
                    <p>SqFt: {activeProperty.sqft.toLocaleString()}</p>
                </div>
            </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}

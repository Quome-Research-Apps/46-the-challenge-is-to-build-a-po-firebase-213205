'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';
import type { PropertySale } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onDataUploaded: (data: PropertySale[], csvString: string) => void;
}

const keyMapping: { [key: string]: keyof Omit<PropertySale, 'id'> } = {
    'address': 'address',
    'latitude': 'latitude',
    'longitude': 'longitude',
    'price': 'price',
    'sale date': 'saleDate',
    'sqft': 'sqft',
    'property type': 'propertyType'
};

export default function FileUploader({ onDataUploaded }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const uploadedFile = event.target.files[0];
      setFile(uploadedFile);
      setFileName(uploadedFile.name);
      parseFile(uploadedFile);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile.type === "text/csv") {
        setFile(droppedFile);
        setFileName(droppedFile.name);
        parseFile(droppedFile);
        if (fileInputRef.current) {
            fileInputRef.current.files = event.dataTransfer.files;
        }
      } else {
        toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please upload a valid CSV file.",
        });
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };


  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvString = e.target?.result as string;
      Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const parsedData = results.data
              .map((row: any, index: number): PropertySale | null => {
                const mappedRow: any = { id: String(index) };
                let hasRequiredKeys = true;
                for (const key in row) {
                    const normalizedKey = key.trim().toLowerCase();
                    if(keyMapping[normalizedKey]) {
                        mappedRow[keyMapping[normalizedKey]] = row[key];
                    }
                }
                
                if(!mappedRow.latitude || !mappedRow.longitude || !mappedRow.price || !mappedRow.saleDate) {
                  return null;
                }

                return {
                  ...mappedRow,
                  latitude: parseFloat(mappedRow.latitude),
                  longitude: parseFloat(mappedRow.longitude),
                  price: parseInt(mappedRow.price, 10),
                  sqft: parseInt(mappedRow.sqft, 10) || 0,
                  saleDate: new Date(mappedRow.saleDate),
                  propertyType: mappedRow.propertyType || 'Unknown',
                };
              })
              .filter((item): item is PropertySale => item !== null && !isNaN(item.latitude) && !isNaN(item.longitude) && !isNaN(item.price) && item.saleDate instanceof Date && !isNaN(item.saleDate.getTime()));
            
            if (parsedData.length === 0) {
              throw new Error("No valid data rows found. Check your CSV format.");
            }
              
            onDataUploaded(parsedData, csvString);
            toast({
              title: "Upload Successful",
              description: `${parsedData.length} records loaded from ${file.name}.`,
            });
          } catch(error: any) {
            console.error("Parsing error:", error);
            toast({
                variant: "destructive",
                title: "File Parsing Error",
                description: error.message || "Could not parse CSV. Please check the file format and required columns (latitude, longitude, price, sale date).",
            });
          }
        },
        error: (error: any) => {
            console.error("PapaParse error:", error);
             toast({
                variant: "destructive",
                title: "Upload Failed",
                description: error.message,
            });
        }
      });
    };
    reader.readAsText(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Upload Data</CardTitle>
        <CardDescription>Upload a CSV file with property sales data.</CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="w-10 h-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-semibold text-accent">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">CSV file (up to 10MB)</p>
          <Input 
            ref={fileInputRef}
            id="file-upload" 
            type="file" 
            className="hidden" 
            accept=".csv" 
            onChange={handleFileChange}
          />
        </div>
        {fileName && <p className="mt-2 text-sm text-center text-muted-foreground">File: {fileName}</p>}
      </CardContent>
    </Card>
  );
}

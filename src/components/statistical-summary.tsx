'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
import { generateStatisticalSummary } from '@/ai/flows/generate-statistical-summary';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

interface StatisticalSummaryProps {
  csvData: string;
}

export default function StatisticalSummary({ csvData }: StatisticalSummaryProps) {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary('');
    try {
      const result = await generateStatisticalSummary({ csvData });
      setSummary(result.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate statistical summary.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">AI Summary</CardTitle>
        <CardDescription>Generate an AI-powered statistical summary.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGenerateSummary} disabled={isLoading || !csvData} className="w-full">
          {isLoading ? (
            'Generating...'
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" /> Generate Summary
            </>
          )}
        </Button>
        {isLoading && (
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
        {summary && (
          <div className="mt-4 text-sm text-muted-foreground prose prose-invert prose-p:my-2">
            {summary.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

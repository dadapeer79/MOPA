'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { getBusinessInsights, type BusinessInsightsOutput } from '@/ai/flows/business-insights-flow';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Loader2, Lightbulb, VolumeX } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ChartConfig } from '@/components/ui/chart';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { InsightCard } from './components/insight-card';
import { stopAllSpeech } from '@/hooks/use-speech';
import { useSpeech } from '@/hooks/use-speech';

const insightsFormSchema = z.object({
  question: z.string().min(10, { message: 'Please ask a more detailed question.' }),
  language: z.enum(['en', 'hi', 'kn']),
});

type InsightsFormValues = z.infer<typeof insightsFormSchema>;

const chartConfig = {
  value: {
    label: 'Value',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function AiAssistantPage() {
  const [insight, setInsight] = useState<BusinessInsightsOutput | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  const insightsForm = useForm<InsightsFormValues>({
    resolver: zodResolver(insightsFormSchema),
    defaultValues: {
      question: '',
      language: 'en',
    },
  });

  async function onInsightSubmit(values: InsightsFormValues) {
    setIsInsightLoading(true);
    setInsight(null);
    try {
      const result = await getBusinessInsights(values);
      if (!result || !result.textResponse) {
        throw new Error('Invalid response from AI');
      }
      setInsight(result);
      insightsForm.reset({ question: '', language: values.language });
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: 'Could not generate insights. Please try again later.',
      });
    } finally {
      setIsInsightLoading(false);
    }
  };

  const suggestionPrompts = [
    "How can I optimize my inventory management based on recent sales data?",
    "Which product categories are performing best in terms of profit margin?",
    "Analyze my cash flow trends and suggest improvements",
    "What are my top selling products and when do they sell best?",
    "Compare my business performance with last month and suggest areas for improvement"
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="AI Assistant"
        description="Ask questions about your business and get AI-powered analysis and suggestions."
      />
      <Card className="shadow-sm border-border/60">
        <Form {...insightsForm}>
          <form onSubmit={insightsForm.handleSubmit(onInsightSubmit)}>
            <CardHeader>
                <CardTitle>Ask the AI Analyst</CardTitle>
                <CardDescription>
                    Get detailed insights about your sales, expenses, inventory, and business performance.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={insightsForm.control}
                    name="language"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Response Language</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                            >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="en" />
                                </FormControl>
                                <FormLabel className="font-normal">English</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="hi" />
                                </FormControl>
                                <FormLabel className="font-normal">Hindi</FormLabel>
                            </FormItem>
                             <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="kn" />
                                </FormControl>
                                <FormLabel className="font-normal">Kannada</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

              <FormField
                control={insightsForm.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Question</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ask about sales trends, inventory management, profit analysis, or business performance..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-wrap gap-2">
                {suggestionPrompts.map(prompt => (
                  <Button
                    key={prompt}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      insightsForm.setValue('question', prompt);
                      insightsForm.trigger('question');
                    }}
                  >
                    <Lightbulb className="mr-2 h-4 w-4" />
                    {prompt}
                  </Button>
                ))}
              </div>
            </CardContent>
            <CardContent>
              <Button type="submit" disabled={isInsightLoading} className="w-full md:w-auto">
                {isInsightLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Business Insights
                  </>
                )}
              </Button>
            </CardContent>
          </form>
        </Form>
      </Card>
      
      <div className="min-h-[400px] relative">
        {/* Global Stop Button */}
        <div className="absolute right-4 -top-12 z-10">
          <Button
            variant="destructive"
            size="sm"
            onClick={stopAllSpeech}
            className="relative group"
          >
            <VolumeX className="h-4 w-4" />
            <span className="sr-only">Stop all speech</span>
            <div className="absolute hidden group-hover:block -bottom-10 left-1/2 transform -translate-x-1/2 bg-background text-foreground text-xs px-2 py-1 rounded border whitespace-nowrap">
              Stop all speech
            </div>
          </Button>
        </div>
        
        {isInsightLoading ? (
            <Card className="shadow-sm border-border/60 animate-pulse">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                     </div>
                     <div>
                        <Skeleton className="h-64 w-full" />
                     </div>
                </CardContent>
            </Card>
        ) : insight ? (
            <InsightCard 
              insight={insight}
              chartConfig={chartConfig}
              language={insightsForm.getValues('language')}
            />
        ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-border">
                <div className="text-center text-muted-foreground">
                    <Sparkles className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-lg font-semibold">Your AI-powered insights will appear here</h3>
                    <p className="text-sm">Ask a question to get started with personalized business analysis.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { getBusinessInsights, type BusinessInsightsOutput } from '@/ai/flows/business-insights-flow';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Loader2, Lightbulb, Volume2, Square, BarChart as ChartIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
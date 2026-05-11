import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Lightbulb, BarChartIcon } from 'lucide-react';
import { TextToSpeech } from '@/components/text-to-speech';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import type { BusinessInsightsOutput } from '@/ai/flows/business-insights-flow';

interface InsightCardProps {
  insight: BusinessInsightsOutput;
  chartConfig: ChartConfig;
  language: 'en' | 'hi' | 'kn';
}

export function InsightCard({ insight, chartConfig, language }: InsightCardProps) {
  return (
    <Card className="shadow-sm border-border/60 animate-in fade-in-50">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Insights & Recommendations
              </h3>
              <TextToSpeech
                text={insight.textResponse}
                language={language}
              />
            </div>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap bg-muted/50 p-4 rounded-md border">
              {insight.textResponse}
            </p>
          </div>
        </div>
        {insight.chartData && insight.chartData.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChartIcon className="h-5 w-5 text-primary" />
                {insight.chartTitle || 'Data Visualization'}
              </h3>
              {insight.chartSubtitle && (
                <p className="text-sm text-muted-foreground">{insight.chartSubtitle}</p>
              )}
            </div>
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <BarChart data={insight.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickMargin={10} />
                <ChartTooltip
                  content={(props) => {
                    const value = props.payload?.[0]?.value;
                    const trend = props.payload?.[0]?.payload?.trend;

                    return (
                      <div className="rounded-lg bg-background p-2 border shadow-sm">
                        <div className="font-medium">₹{value?.toLocaleString()}</div>
                        {trend !== undefined && (
                          <div
                            className={
                              trend > 0 ? 'text-success' : trend < 0 ? 'text-destructive' : ''
                            }
                          >
                            {trend > 0 ? '+' : ''}
                            {trend}%
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={[4, 4, 0, 0]}
                  {...(insight.chartData.some((d) => d.color) && {
                    fill: undefined,
                    stroke: 'var(--color-value)',
                    fillOpacity: 0.8,
                  })}
                />
              </BarChart>
            </ChartContainer>

            {insight.insights && insight.insights.length > 0 && (
              <div className="space-y-3 mt-4">
                <h4 className="font-semibold text-sm">Key Insights</h4>
                <div className="space-y-2">
                  {insight.insights.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-2 text-sm p-2 rounded-md ${
                        item.type === 'positive'
                          ? 'bg-success/10 text-success-foreground'
                          : item.type === 'negative'
                          ? 'bg-destructive/10 text-destructive-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="mt-0.5">
                        {item.type === 'positive'
                          ? '↑'
                          : item.type === 'negative'
                          ? '↓'
                          : '•'}
                      </div>
                      <div>
                        {item.message}
                        {item.metric && item.change && (
                          <span className="ml-1 font-medium">
                            ({item.change > 0 ? '+' : ''}
                            {item.change}% {item.metric})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {insight.recommendations && insight.recommendations.length > 0 && (
              <div className="space-y-3 mt-4">
                <h4 className="font-semibold text-sm">Recommendations</h4>
                <div className="space-y-2">
                  {insight.recommendations
                    .sort((a, b) => {
                      const impactOrder = { high: 0, medium: 1, low: 2 };
                      return impactOrder[a.impact] - impactOrder[b.impact];
                    })
                    .map((rec, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-2 p-2 rounded-md text-sm ${
                          rec.impact === 'high'
                            ? 'bg-destructive/10 text-destructive-foreground'
                            : rec.impact === 'medium'
                            ? 'bg-warning/10 text-warning-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="shrink-0 mt-1">
                          {rec.impact === 'high' ? '!' : rec.impact === 'medium' ? '•' : '○'}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{rec.message}</div>
                          <div className="text-xs mt-1 text-muted-foreground flex gap-2">
                            <span>Impact: {rec.impact}</span>
                            <span>•</span>
                            <span>Timeline: {rec.timeframe}</span>
                            <span>•</span>
                            <span>Category: {rec.category}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
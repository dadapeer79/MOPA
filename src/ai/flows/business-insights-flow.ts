'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getMockInvoices } from '@/services/invoices';
import { getMockExpenses } from '@/services/expenses';
import { getMockSalesData } from '@/services/sales';
import { translate, formatCurrency, formatPercentage } from '@/utils/translations';

// Type definitions
interface SalesDataPoint {
  date: string;
  sales: number;
  category: string;
}

interface TrendAnalysis {
  category: string;
  trend: number;
  average: number;
  total: number;
}

// Schema definitions
const ChartDataSchema = z.object({
  name: z.string().describe('The label for the data point'),
  value: z.number().describe('The numerical value'),
  trend: z.number().optional().describe('Trend percentage'),
  color: z.string().optional().describe('Custom color for the bar'),
  info: z.string().optional().describe('Additional information for tooltip')
});

const InsightItemSchema = z.object({
    type: z.enum(['positive', 'negative', 'neutral']),
    message: z.string(),
    metric: z.string().optional(),
    change: z.number().optional(),
    priority: z.number().optional()
});

const RecommendationSchema = z.object({
    message: z.string(),
    impact: z.enum(['high', 'medium', 'low']),
    timeframe: z.enum(['immediate', 'short-term', 'long-term']),
    category: z.enum(['sales', 'expenses', 'inventory', 'cashflow', 'general'])
});

const BusinessInsightsOutputSchema = z.object({
  textResponse: z.string().describe('A detailed, insightful text response to the user\'s question'),
  chartTitle: z.string().describe('A descriptive title for the chart'),
  chartSubtitle: z.string().optional().describe('Additional context for the chart'),
  chartData: z.array(ChartDataSchema).describe('Data for visualization'),
  insights: z.array(InsightItemSchema).describe('Key insights and findings'),
  recommendations: z.array(RecommendationSchema).describe('Actionable recommendations'),
  kpis: z.array(z.object({
    label: z.string(),
    value: z.string(),
    trend: z.number().optional(),
    status: z.enum(['positive', 'negative', 'neutral']).optional()
  })).optional().describe('Key performance indicators')
});

export type BusinessInsightsOutput = z.infer<typeof BusinessInsightsOutputSchema>;

const BusinessInsightsInputSchema = z.object({
    question: z.string(),
    language: z.enum(['en', 'hi', 'kn']),
});

export async function getBusinessInsights(input: z.infer<typeof BusinessInsightsInputSchema>): Promise<BusinessInsightsOutput> {
  return businessInsightsFlow(input);
}

function calculateTrends(data: any[], period = 30) {
    const trends = new Map();
    
    for (const item of data) {
        const date = new Date(item.date);
        const category = item.category || 'uncategorized';
        if (!trends.has(category)) {
            trends.set(category, {
                current: 0,
                previous: 0,
                count: 0
            });
        }
        
        const daysDiff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
        const value = item.amount || item.sales || 0;
        
        const record = trends.get(category);
        if (daysDiff <= period) {
            record.current += value;
            record.count++;
        } else if (daysDiff <= period * 2) {
            record.previous += value;
        }
    }
    
    return Array.from(trends.entries()).map(([category, data]) => ({
        category,
        trend: data.previous ? ((data.current - data.previous) / data.previous) * 100 : 0,
        average: data.count ? data.current / data.count : 0,
        total: data.current
    }));
}

type StatusType = 'positive' | 'negative' | 'neutral';

const getStatusFromValue = (value: number, thresholds: { positive: number; neutral: number }): StatusType => {
  if (value >= thresholds.positive) return 'positive';
  if (value >= thresholds.neutral) return 'neutral';
  return 'negative';
};

const businessInsightsFlow = ai.defineFlow(
  {
    name: 'businessInsightsFlow',
    inputSchema: BusinessInsightsInputSchema,
    outputSchema: BusinessInsightsOutputSchema,
  },
  async ({ question, language }) => {
    try {
      // Fetch all relevant data
      const [invoices, expenses, salesData] = await Promise.all([
        getMockInvoices(),
        getMockExpenses(),
        getMockSalesData('yearly'),
      ]);
      
      // Transform sales data into a more detailed format
      const sales = salesData.map(sale => ({
        ...sale,
        category: 'Uncategorized'  // Default category since it's not in the original data
      }));

      // Calculate trends and insights
      const expenseTrends = calculateTrends(expenses);
      const salesTrends = calculateTrends(sales);
      
      // Calculate key metrics
      const totalRevenue = invoices.reduce((acc, inv) => acc + inv.amount, 0);
      const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = (netProfit / totalRevenue) * 100;
      
      // Group expenses by category
      const expensesByCategory = expenses.reduce((acc, exp) => {
        if (!acc[exp.category]) acc[exp.category] = 0;
        acc[exp.category] += exp.amount;
        return acc;
      }, {} as Record<string, number>);

      // Initialize response object
      const response: BusinessInsightsOutput = {
        textResponse: '',
        chartTitle: '',
        chartData: [],
        insights: [],
        recommendations: []
      };

      // Analyze question type and context
      const questionLower = question.toLowerCase();

      // Analyze based on question type
      if (questionLower.includes('inventory') || questionLower.includes('stock')) {
        // Inventory optimization analysis
        const salesByProduct = new Map();
        sales.forEach(sale => {
          const productName = sale.category || 'Uncategorized';
          if (!salesByProduct.has(productName)) {
            salesByProduct.set(productName, {
              total: 0,
              frequency: 0,
              lastSale: null
            });
          }
          const product = salesByProduct.get(productName);
          product.total += sale.sales;
          product.frequency += 1;
          product.lastSale = sale.date;
        });

        response.textResponse = `Based on your recent sales data, here's how you can optimize your inventory:\n\n` +
          `1. Fast-Moving Items: Focus on maintaining optimal stock levels for your most frequently sold items\n` +
          `2. Sales Patterns: We've identified peak sales periods to help you plan inventory\n` +
          `3. Stock Recommendations: Suggested reorder points based on sales velocity`;

        response.chartTitle = 'Product Sales Analysis';
        response.chartSubtitle = 'Showing sales frequency and volume by product';
        
        response.chartData = Array.from(salesByProduct.entries())
          .map(([name, data]) => ({
            name,
            value: data.frequency,
            trend: data.total / data.frequency,
            info: `Last sale: ${new Date(data.lastSale).toLocaleDateString()}`
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);

        response.recommendations = [
          {
            message: 'Optimize stock levels based on sales velocity',
            impact: 'high',
            timeframe: 'immediate',
            category: 'inventory'
          },
          {
            message: 'Set up alerts for low-stock items',
            impact: 'medium',
            timeframe: 'short-term',
            category: 'inventory'
          }
        ];

      } else if (questionLower.includes('expense')) {
        // Expense analysis
        const topExpenses = Object.entries(expensesByCategory)
          .sort(([, a], [, b]) => b - a);

        if (language === 'hi') {
          response.textResponse = `खर्च विश्लेषण:\n\n` +
            `1. सर्वाधिक खर्च श्रेणियां:\n` +
            topExpenses.slice(0, 3).map(([category, amount], index) => 
              `   ${index + 1}. ${category}: ${formatCurrency(amount, language)} (कुल खर्च का ${((amount/totalExpenses) * 100).toFixed(1)}%)`
            ).join('\n') + '\n\n' +
            `2. खर्च के रुझान:\n` +
            expenseTrends.map(t => 
              `   • ${t.category}: ${t.trend > 0 ? '⬆️' : '⬇️'} ${Math.abs(t.trend).toFixed(1)}% (औसत: ${formatCurrency(t.average, language)} प्रति दिन)`
            ).join('\n') + '\n\n' +
            `3. खर्च प्रबंधन सुझाव:\n` +
            `   • उच्च-खर्च वाली श्रेणियों की नियमित निगरानी करें\n` +
            `   • नकारात्मक रुझानों पर ध्यान दें और सुधार करें\n` +
            `   • खर्च में कटौती के अवसरों की पहचान करें`;
        } else if (language === 'kn') {
          response.textResponse = `ವೆಚ್ಚಗಳ ವಿಶ್ಲೇಷಣೆ:\n\n` +
            `1. ಅತಿ ಹೆಚ್ಚಿನ ವೆಚ್ಚದ ವರ್ಗಗಳು:\n` +
            topExpenses.slice(0, 3).map(([category, amount], index) => 
              `   ${index + 1}. ${category}: ${formatCurrency(amount, language)} (ಒಟ್ಟು ವೆಚ್ಚದ ${((amount/totalExpenses) * 100).toFixed(1)}%)`
            ).join('\n') + '\n\n' +
            `2. ವೆಚ್ಚದ ಪ್ರವೃತ್ತಿಗಳು:\n` +
            expenseTrends.map(t => 
              `   • ${t.category}: ${t.trend > 0 ? '⬆️' : '⬇️'} ${Math.abs(t.trend).toFixed(1)}% (ಸರಾಸರಿ: ${formatCurrency(t.average, language)} ಪ್ರತಿ ದಿನ)`
            ).join('\n') + '\n\n' +
            `3. ವೆಚ್ಚ ನಿರ್ವಹಣೆ ಸಲಹೆಗಳು:\n` +
            `   • ಹೆಚ್ಚಿನ ವೆಚ್ಚದ ವರ್ಗಗಳನ್ನು ನಿಯಮಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ\n` +
            `   • ಋಣಾತ್ಮಕ ಪ್ರವೃತ್ತಿಗಳನ್ನು ಗಮನಿಸಿ ಮತ್ತು ಸುಧಾರಿಸಿ\n` +
            `   • ವೆಚ್ಚ ಕಡಿತದ ಅವಕಾಶಗಳನ್ನು ಗುರುತಿಸಿ`;
        } else {
          response.textResponse = `Expense Analysis:\n\n` +
            `1. Highest Expense Categories:\n` +
            topExpenses.slice(0, 3).map(([category, amount], index) => 
              `   ${index + 1}. ${category}: ${formatCurrency(amount, language)} (${((amount/totalExpenses) * 100).toFixed(1)}% of total expenses)`
            ).join('\n') + '\n\n' +
            `2. Expense Trends:\n` +
            expenseTrends.map(t => 
              `   • ${t.category}: ${t.trend > 0 ? '⬆️' : '⬇️'} ${Math.abs(t.trend).toFixed(1)}% (Avg: ${formatCurrency(t.average, language)} per day)`
            ).join('\n') + '\n\n' +
            `3. Cost Management Recommendations:\n` +
            `   • Monitor high-spend categories regularly\n` +
            `   • Address negative trends\n` +
            `   • Identify cost-saving opportunities`;
        }

        response.chartTitle = translate('expenses', language);
        response.chartSubtitle = translate('performanceAnalysis', language);
        
        response.chartData = Object.entries(expensesByCategory).map(([name, value]) => ({
          name,
          value,
          trend: expenseTrends.find(t => t.category === name)?.trend || 0,
          color: value > totalExpenses * 0.3 ? 'var(--destructive)' : undefined
        }));

        response.recommendations = [
          {
            message: 'Monitor high-spend categories',
            impact: 'high',
            timeframe: 'immediate',
            category: 'expenses'
          },
          {
            message: 'Implement cost-saving measures in top expense categories',
            impact: 'medium',
            timeframe: 'short-term',
            category: 'expenses'
          }
        ];

      } else if (questionLower.includes('sales')) {
        // Sales analysis
        const salesAnalysis = salesTrends.sort((a, b) => b.total - a.total);
        const topPerformer = salesAnalysis[0];
        const underperformer = salesAnalysis[salesAnalysis.length - 1];
        const avgTrend = salesTrends.reduce((acc, curr) => acc + curr.trend, 0) / salesTrends.length;

        if (language === 'hi') {
          response.textResponse = `बिक्री प्रदर्शन विश्लेषण:\n\n` +
            `1. सर्वोत्तम प्रदर्शन श्रेणी:\n` +
            `   • ${topPerformer.category}\n` +
            `   • कुल बिक्री: ${formatCurrency(topPerformer.total, language)}\n` +
            `   • वृद्धि: ${formatPercentage(topPerformer.trend, language)}\n\n` +
            `2. सुधार के क्षेत्र:\n` +
            `   • ${underperformer.category}\n` +
            `   • वर्तमान बिक्री: ${formatCurrency(underperformer.total, language)}\n` +
            `   • वृद्धि दर: ${formatPercentage(underperformer.trend, language)}\n\n` +
            `3. समग्र प्रवृत्ति:\n` +
            `   • ${avgTrend > 0 ? 'सकारात्मक वृद्धि' : 'ध्यान देने की आवश्यकता है'}\n` +
            `   • औसत वृद्धि दर: ${formatPercentage(avgTrend, language)}\n\n` +
            `4. सुझाव:\n` +
            `   • सफल श्रेणियों की रणनीतियों को दोहराएं\n` +
            `   • कम प्रदर्शन वाले क्षेत्रों पर ध्यान दें\n` +
            `   • बाजार की प्रवृत्तियों का नियमित विश्लेषण करें`;
        } else if (language === 'kn') {
          response.textResponse = `ಮಾರಾಟ ಕಾರ್ಯಕ್ಷಮತೆ ವಿಶ್ಲೇಷಣೆ:\n\n` +
            `1. ಅತ್ಯುತ್ತಮ ಕಾರ್ಯಕ್ಷಮತೆಯ ವರ್ಗ:\n` +
            `   • ${topPerformer.category}\n` +
            `   • ಒಟ್ಟು ಮಾರಾಟ: ${formatCurrency(topPerformer.total, language)}\n` +
            `   • ಬೆಳವಣಿಗೆ: ${formatPercentage(topPerformer.trend, language)}\n\n` +
            `2. ಸುಧಾರಣೆಯ ಕ್ಷೇತ್ರಗಳು:\n` +
            `   • ${underperformer.category}\n` +
            `   • ಪ್ರಸ್ತುತ ಮಾರಾಟ: ${formatCurrency(underperformer.total, language)}\n` +
            `   • ಬೆಳವಣಿಗೆ ದರ: ${formatPercentage(underperformer.trend, language)}\n\n` +
            `3. ಒಟ್ಟಾರೆ ಪ್ರವೃತ್ತಿ:\n` +
            `   • ${avgTrend > 0 ? 'ಧನಾತ್ಮಕ ಬೆಳವಣಿಗೆ' : 'ಗಮನ ಬೇಕಾಗಿದೆ'}\n` +
            `   • ಸರಾಸರಿ ಬೆಳವಣಿಗೆ ದರ: ${formatPercentage(avgTrend, language)}\n\n` +
            `4. ಶಿಫಾರಸುಗಳು:\n` +
            `   • ಯಶಸ್ವಿ ವರ್ಗಗಳ ತಂತ್ರಗಳನ್ನು ಅಳವಡಿಸಿಕೊಳ್ಳಿ\n` +
            `   • ಕಡಿಮೆ ಕಾರ್ಯಕ್ಷಮತೆಯ ವರ್ಗಗಳ ಮೇಲೆ ಗಮನ ಹರಿಸಿ\n` +
            `   • ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಗಳನ್ನು ನಿಯಮಿತವಾಗಿ ವಿಶ್ಲೇಷಿಸಿ`;
        } else {
          response.textResponse = `📈 Comprehensive Sales Performance Analysis\n\n` +
            `1. Star Performers in Your Business\n` +
            `Let's celebrate your top performing category:\n\n` +
            `• Category: ${topPerformer.category}\n` +
            `• Amazing sales achievement: ${formatCurrency(topPerformer.total, language)}\n` +
            `• Growth trajectory: ${formatPercentage(topPerformer.trend, language)}\n` +
            `  ${topPerformer.trend > 20 ? '🌟 Exceptional growth - this category is thriving!' :
               topPerformer.trend > 10 ? '📈 Strong positive growth - keep up the momentum' :
               topPerformer.trend > 0 ? '👍 Positive growth with room for acceleration' :
               '⚠️ Despite high sales, growth has slowed - needs attention'}\n\n` +
            
            `2. Areas Needing Your Attention\n` +
            `Let's look at opportunities for improvement:\n\n` +
            `• Category requiring focus: ${underperformer.category}\n` +
            `• Current performance: ${formatCurrency(underperformer.total, language)}\n` +
            `• Growth status: ${formatPercentage(underperformer.trend, language)}\n` +
            `  ${underperformer.trend < -20 ? '🚨 Significant decline - immediate action needed' :
               underperformer.trend < -10 ? '⚠️ Noticeable decline - requires strategic intervention' :
               underperformer.trend < 0 ? '📉 Slight decline - monitor and optimize' :
               '✅ Showing improvement - continue supporting growth'}\n\n` +
            
            `3. Overall Business Trajectory\n` +
            `Here's the bigger picture of your sales performance:\n\n` +
            `• Overall direction: ${avgTrend > 0 ? '📈 Positive Growth Path' : '⚠️ Needs Strategic Attention'}\n` +
            `• Business momentum: ${formatPercentage(avgTrend, language)} average growth\n` +
            `  ${avgTrend > 15 ? '🌟 Exceptional overall growth - your strategies are working brilliantly!' :
               avgTrend > 5 ? '💪 Healthy growth - your business is on the right track' :
               avgTrend > 0 ? '👍 Positive but modest growth - look for acceleration opportunities' :
               '🎯 Time to implement growth-focused strategies'}\n\n` +
            
            `4. Strategic Recommendations\n` +
            `Based on your sales data, here are targeted actions for growth:\n\n` +
            `Success Replication:\n` +
            `• Analyze what makes ${topPerformer.category} successful\n` +
            `• Document and implement these winning strategies in other categories\n` +
            `• Consider staff training to share best practices\n\n` +
            
            `Improvement Focus:\n` +
            `• Create a dedicated action plan for ${underperformer.category}\n` +
            `• Set specific, measurable goals for improvement\n` +
            `• Consider customer feedback and market research\n\n` +
            
            `Ongoing Optimization:\n` +
            `• Monitor sales trends weekly\n` +
            `• Adjust strategies based on performance data\n` +
            `• Stay aligned with market dynamics and customer needs\n\n` +
            
            `5. Key Action Items for Next 30 Days:\n` +
            `${avgTrend > 0 ? 
              '• Capitalize on growth momentum\n• Expand successful product lines\n• Invest in high-performing areas' :
              '• Review pricing strategy\n• Enhance marketing efforts\n• Focus on customer retention'}\n` +
            `• Regular performance reviews to stay on track`;
        }

        response.chartTitle = translate('salesPerformance', language);
        response.chartSubtitle = translate('performanceAnalysis', language);
        
        response.chartData = salesAnalysis.map(trend => ({
          name: trend.category,
          value: trend.total,
          trend: trend.trend,
          color: trend.trend > 0 ? 'var(--success)' : trend.trend < -10 ? 'var(--destructive)' : undefined
        }));

        response.recommendations = [
          {
            message: 'Focus on improving underperforming areas',
            impact: 'high',
            timeframe: 'immediate',
            category: 'sales'
          },
          {
            message: 'Replicate successful strategies from top-performing categories',
            impact: 'medium',
            timeframe: 'short-term',
            category: 'sales'
          }
        ];

      } else {
        // General business overview
        const healthStatus = profitMargin > 20 ? translate('strong', language) : 
                           profitMargin > 10 ? translate('stable', language) : 
                           translate('needsAttention', language);

        const profitStatus = netProfit > 0 ? translate('profitable', language) : translate('loss', language);
        
        if (language === 'hi') {
          response.textResponse = `व्यापार का समग्र प्रदर्शन:\n\n` +
            `1. वित्तीय स्थिति: ${healthStatus}\n` +
            `   - लाभ मार्जिन: ${formatPercentage(profitMargin, language)}\n` +
            `   - वर्तमान स्थिति: ${profitStatus}\n\n` +
            `2. राजस्व विश्लेषण:\n` +
            `   - कुल राजस्व: ${formatCurrency(totalRevenue, language)}\n` +
            `   - कुल लेनदेन: ${invoices.length}\n` +
            `   - औसत लेनदेन राशि: ${formatCurrency(totalRevenue / invoices.length, language)}\n\n` +
            `3. खर्च विश्लेषण:\n` +
            `   - कुल खर्च: ${formatCurrency(totalExpenses, language)}\n` +
            `   - प्रमुख खर्च श्रेणियां: ${Object.entries(expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([category, amount]) => `${category} (${formatCurrency(amount, language)})`)
                .join(', ')}\n\n` +
            `4. लाभप्रदता:\n` +
            `   - शुद्ध लाभ: ${formatCurrency(netProfit, language)}\n` +
            `   - लाभ मार्जिन: ${formatPercentage(profitMargin, language)}\n` +
            `   - निवेश पर प्रतिफल: ${formatPercentage((netProfit / totalExpenses) * 100, language)}`;
        } else if (language === 'kn') {
          response.textResponse = `ವ್ಯಾಪಾರದ ಒಟ್ಟಾರೆ ಕಾರ್ಯಕ್ಷಮತೆ:\n\n` +
            `1. ಆರ್ಥಿಕ ಆರೋಗ್ಯ: ${healthStatus}\n` +
            `   - ಲಾಭದ ಮಾರ್ಜಿನ್: ${formatPercentage(profitMargin, language)}\n` +
            `   - ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ: ${profitStatus}\n\n` +
            `2. ಆದಾಯ ವಿಶ್ಲೇಷಣೆ:\n` +
            `   - ಒಟ್ಟು ಆದಾಯ: ${formatCurrency(totalRevenue, language)}\n` +
            `   - ಒಟ್ಟು ವಹಿವಾಟುಗಳು: ${invoices.length}\n` +
            `   - ಸರಾಸರಿ ವಹಿವಾಟು ಮೊತ್ತ: ${formatCurrency(totalRevenue / invoices.length, language)}\n\n` +
            `3. ವೆಚ್ಚ ವಿಶ್ಲೇಷಣೆ:\n` +
            `   - ಒಟ್ಟು ವೆಚ್ಚ: ${formatCurrency(totalExpenses, language)}\n` +
            `   - ಪ್ರಮುಖ ವೆಚ್ಚದ ವರ್ಗಗಳು: ${Object.entries(expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([category, amount]) => `${category} (${formatCurrency(amount, language)})`)
                .join(', ')}\n\n` +
            `4. ಲಾಭದಾಯಕತೆ:\n` +
            `   - ನಿವ್ವಳ ಲಾಭ: ${formatCurrency(netProfit, language)}\n` +
            `   - ಲಾಭದ ಮಾರ್ಜಿನ್: ${formatPercentage(profitMargin, language)}\n` +
            `   - ಹೂಡಿಕೆಯ ಮೇಲಿನ ಆದಾಯ: ${formatPercentage((netProfit / totalExpenses) * 100, language)}`;
        } else {
          response.textResponse = `📊 Detailed Business Performance Analysis\n\n` +
            `1. Financial Health Status: ${healthStatus}\n` +
            `Let's break down your business's financial performance in detail:\n\n` +
            `• Your profit margin is ${formatPercentage(profitMargin, language)}, which means for every rupee of sales, you're keeping ${formatPercentage(profitMargin, language)} as profit\n` +
            `• Current business status is ${profitStatus} - ${profitMargin > 20 ? 'this is excellent performance!' : profitMargin > 10 ? 'your business is maintaining stability' : 'there\'s room for improvement'}\n\n` +
            
            `2. Revenue Deep Dive:\n` +
            `Here's a detailed look at your income streams:\n\n` +
            `• Your business has generated total revenue of ${formatCurrency(totalRevenue, language)}\n` +
            `• You've successfully completed ${invoices.length} transactions\n` +
            `• On average, each transaction brings in ${formatCurrency(totalRevenue / invoices.length, language)}\n` +
            `  💡 Tip: ${(totalRevenue / invoices.length) > 1000 ? 'Your high average transaction value suggests premium pricing - consider customer loyalty programs' : 'Consider strategies to increase average transaction value through upselling'}\n\n` +
            
            `3. Expense Breakdown:\n` +
            `Understanding where your money goes:\n\n` +
            `• Total spending: ${formatCurrency(totalExpenses, language)}\n` +
            `• Major expense areas:\n${Object.entries(expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([category, amount], index) => 
                  `   ${index + 1}. ${category}: ${formatCurrency(amount, language)} (${((amount/totalExpenses) * 100).toFixed(1)}% of total expenses)\n      ${
                    amount > totalExpenses * 0.3 ? '⚠️ This is a significant expense area - consider cost optimization' : 
                    amount > totalExpenses * 0.2 ? '👀 Keep monitoring this expense category' : '✅ This expense appears well managed'
                  }`
                ).join('\n')}\n\n` +
            
            `4. Profitability Analysis:\n` +
            `Here's how your business is performing in terms of profit:\n\n` +
            `• Net Profit: ${formatCurrency(netProfit, language)}\n` +
            `  ${netProfit > 0 ? '🎉 Your business is generating positive returns' : '⚠️ Your business is currently operating at a loss'}\n\n` +
            `• Profit Margin: ${formatPercentage(profitMargin, language)}\n` +
            `  ${profitMargin > 20 ? '🌟 Exceptional profit margin - your pricing and cost management are very effective' :
               profitMargin > 10 ? '👍 Healthy profit margin - continue monitoring for improvement opportunities' :
               '⚠️ Consider strategies to improve profit margin through cost reduction or price optimization'}\n\n` +
            `• Return on Investment: ${formatPercentage((netProfit / totalExpenses) * 100, language)}\n` +
            `  ${(netProfit / totalExpenses) > 1 ? '💪 Strong ROI - your investments are paying off well' : '📈 There\'s potential to improve return on investment'}\n\n` +
            
            `5. Key Recommendations:\n` +
            `Based on your business performance, here are actionable steps:\n\n` +
            `• ${profitMargin > 20 ? 'Focus on scaling operations while maintaining current efficiency' : 
                profitMargin > 10 ? 'Look for opportunities to optimize high-expense categories' : 
                'Prioritize cost reduction in major expense categories'}\n` +
            `• ${(totalRevenue / invoices.length) > 1000 ? 'Implement customer retention strategies to maintain premium pricing' :
                'Explore opportunities for upselling and premium offerings'}\n` +
            `• ${Object.entries(expensesByCategory)[0][1] > totalExpenses * 0.3 ? 
                'Review and optimize your highest expense category: ' + Object.entries(expensesByCategory)[0][0] :
                'Continue monitoring expense categories for optimization opportunities'}\n` +
            `• Regular financial health checkups will help maintain and improve these metrics`;
        }

        response.chartTitle = translate('financialHealth', language);
        response.chartSubtitle = translate('performanceAnalysis', language);
        
        response.chartData = [
          { name: 'Revenue', value: totalRevenue, color: 'var(--success)' },
          { name: 'Expenses', value: totalExpenses, color: 'var(--destructive)' },
          { name: 'Net Profit', value: netProfit, color: netProfit > 0 ? 'var(--success)' : 'var(--destructive)' }
        ];

        response.recommendations = [
          {
            message: 'Monitor high-spend categories',
            impact: 'high',
            timeframe: 'immediate',
            category: 'expenses'
          },
          {
            message: 'Focus on improving sales in underperforming categories',
            impact: 'medium',
            timeframe: 'short-term',
            category: 'sales'
          }
        ];
      }

      // Add insights
      response.insights = [
        {
          type: profitMargin > 20 ? 'positive' : profitMargin > 10 ? 'neutral' : 'negative',
          message: `Profit margin is at ${profitMargin.toFixed(1)}%`,
          metric: 'profitMargin',
          change: profitMargin
        },
        {
          type: salesTrends.reduce((acc, curr) => acc + curr.trend, 0) / salesTrends.length > 0 ? 'positive' : 'negative',
          message: `Overall sales trend is ${salesTrends.reduce((acc, curr) => acc + curr.trend, 0) / salesTrends.length > 0 ? 'positive' : 'negative'}`,
          metric: 'salesTrend',
          change: salesTrends.reduce((acc, curr) => acc + curr.trend, 0) / salesTrends.length
        }
      ];

      // Add KPIs
      response.kpis = [
        {
          label: 'Total Revenue',
          value: `₹${totalRevenue.toLocaleString()}`,
          status: 'neutral'
        },
        {
          label: 'Net Profit',
          value: `₹${netProfit.toLocaleString()}`,
          status: netProfit > 0 ? 'positive' : 'negative',
          trend: profitMargin
        }
      ];

      return response;

    } catch (error) {
      console.error('Error in business insights flow:', error);
      throw error;
    }
  }
);

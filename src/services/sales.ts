/**
 * @fileOverview A mock service for simulating sales data.
 */
import {
  format,
  subDays,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfWeek,
  startOfMonth,
  subHours,
  eachHourOfInterval,
  subMonths,
} from 'date-fns';

type TimeRange = 'today' | 'daily' | 'weekly' | 'monthly' | 'yearly';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSalesData(date: Date, formatString: string): { date: string; sales: number } {
  const sales = getRandomInt(1000, 5000);
  return {
    date: format(date, formatString),
    sales,
  };
}

export async function getMockSalesData(range: TimeRange = 'daily') {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

  const today = new Date();
  let data: { date: string; sales: number }[] = [];

  switch (range) {
    case 'today': {
        const past12Hours = eachHourOfInterval({
            start: subHours(today, 11),
            end: today,
        });
        data = past12Hours.map((hour) => {
            return {
                date: format(hour, 'ha'),
                sales: getRandomInt(500, 2000),
            }
        });
        break;
    }
    case 'daily': {
      const past7Days = eachDayOfInterval({
        start: subDays(today, 6),
        end: today,
      });
      data = past7Days.map((day) => generateSalesData(day, 'EEE'));
      break;
    }
    case 'weekly': {
      const past8Weeks = eachWeekOfInterval(
        {
          start: subDays(today, 56),
          end: today,
        },
        { weekStartsOn: 1 }
      );
      data = past8Weeks.map((week) => generateSalesData(startOfWeek(week, { weekStartsOn: 1 }), "MMM d"));
      break;
    }
    case 'monthly': {
      const past30Days = eachDayOfInterval({
        start: subDays(today, 29),
        end: today,
      });
      data = past30Days.map((day) => generateSalesData(day, 'MMM d'));
      break;
    }
    case 'yearly': {
        const past12Months = eachMonthOfInterval({
            start: subMonths(today, 11),
            end: today,
        });
        data = past12Months.map((month) => generateSalesData(startOfMonth(month), 'MMM'));
        break;
    }
    default:
      return [];
  }
  return data;
}

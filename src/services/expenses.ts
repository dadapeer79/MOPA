
/**
 * @fileOverview A mock service for simulating expense data.
 */
import { subDays } from 'date-fns';

const expenseCategories = ['inventory', 'utilities', 'rent', 'salaries', 'marketing', 'other'];

const mockExpenseDetails = [
    { description: 'Electricity Bill', category: 'utilities', amountRange: [200, 500] },
    { description: 'Water Bill', category: 'utilities', amountRange: [100, 300] },
    { description: 'Internet Bill', category: 'utilities', amountRange: [150, 400] },
    { description: 'Social Media Ads', category: 'marketing', amountRange: [300, 700] },
    { description: 'New Stock - Biscuits', category: 'inventory', amountRange: [500, 1000] },
    { description: 'New Stock - Beverages', category: 'inventory', amountRange: [800, 1500] },
    { description: 'Office Supplies', category: 'other', amountRange: [100, 400] },
    { description: 'Cleaning Services', category: 'other', amountRange: [200, 500] },
];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const generateExpense = (i: number, data?: any) => {
    const detail = mockExpenseDetails[getRandomInt(0, mockExpenseDetails.length - 1)];
    
    return {
      id: `EXP-${2001 + i}-${Math.random()}`,
      description: data?.description || detail.description,
      amount: data?.amount || parseFloat(getRandomInt(detail.amountRange[0], detail.amountRange[1]).toFixed(2)),
      category: data?.category || detail.category,
      date: data?.date || new Date().toISOString(),
    };
}

let mockExpenses = Array.from({ length: 15 }, (_, i) => generateExpense(i, { date: subDays(new Date(), getRandomInt(0, 90)).toISOString() }));

/**
 * Retrieves a list of mock expenses.
 * @returns A promise that resolves to an array of mock expense objects.
 */
export async function getMockExpenses() {
  await new Promise(resolve => setTimeout(resolve, 600));
  // Add a few new expenses on each call to simulate dynamic data
  const newExpenses = Array.from({ length: getRandomInt(0, 1) }, (_, i) => generateExpense(mockExpenses.length + i));
  mockExpenses = [...newExpenses, ...mockExpenses];
  return mockExpenses;
}

/**
 * Adds a new mock expense.
 * @returns A promise that resolves to the newly created expense.
 */
export async function addMockExpense(expenseData: any) {
  await new Promise(resolve => setTimeout(resolve, 400));
  const newExpense = generateExpense(mockExpenses.length, { ...expenseData, date: new Date().toISOString() });
  mockExpenses = [newExpense, ...mockExpenses];
  return newExpense;
}

/**
 * Deletes a mock expense.
 * @returns A promise that resolves to a success status object.
 */
export async function deleteMockExpense(expenseId: string) {
  await new Promise(resolve => setTimeout(resolve, 400));
  const initialLength = mockExpenses.length;
  mockExpenses = mockExpenses.filter(expense => expense.id !== expenseId);
  
  if (mockExpenses.length < initialLength) {
    return { success: true, message: 'Expense deleted.' };
  } else {
    return { success: false, message: 'Expense not found.' };
  }
}


/**
 * @fileOverview A mock service for simulating UPI transactions.
 */

// Mock database of names for generating random senders
const mockSenders = [
  'Aarav Sharma', 'Vivaan Singh', 'Aditya Kumar', 'Vihaan Gupta', 'Arjun Patel',
  'Sai Reddy', 'Reyansh Joshi', 'Krishna Verma', 'Ishaan Mehta', 'Shaurya Nair',
  'Saanvi Sharma', 'Aanya Singh', 'Aadhya Kumar', 'Ananya Gupta', 'Diya Patel',
  'Pari Reddy', 'Riya Joshi', 'Myra Verma', 'Anika Mehta', 'Tara Nair'
];

/**
 * Generates a random integer between min and max (inclusive).
 */
function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let mockTransactions: any[] = [];

/**
 * Generates a list of mock UPI transactions.
 * @returns A promise that resolves to an array of mock transaction objects.
 */
export async function getRecentTransactions(count = 5) {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  const newTransactions = Array.from({ length: getRandomInt(1, 3) }, (_, i) => {
    const sender = mockSenders[getRandomInt(0, mockSenders.length - 1)];
    const amount = parseFloat((Math.random() * (2500 - 500) + 500).toFixed(2));
    const timestamp = new Date().toISOString();

    return {
      id: `txn_${Date.now()}_${i}`,
      amount,
      sender,
      timestamp,
    };
  });
  
  mockTransactions = [...newTransactions, ...mockTransactions];

  return mockTransactions;
}

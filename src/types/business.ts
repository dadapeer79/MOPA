export type PolicyDuration = 'monthly' | 'yearly';

export type PolicyCategory = 'health' | 'liability' | 'property' | 'cyber' | 'business-interruption';

export interface PolicyBenefit {
  icon: string;
  title: string;
  description: string;
}

export interface PolicyPricing {
  monthly: number;
  yearly: number;
  discount?: number; // Percentage discount for yearly plans
}

export interface BusinessPolicy {
  id: string;
  title: string;
  category: PolicyCategory;
  description: string;
  pricing: PolicyPricing;
  benefits: PolicyBenefit[];
  coverage: string[];
  popular?: boolean;
}

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export type CourseCategory = 
  | 'finance' 
  | 'marketing' 
  | 'operations' 
  | 'leadership' 
  | 'technology' 
  | 'strategy';

export interface CourseModule {
  title: string;
  duration: number; // in minutes
  topics: string[];
}

export interface BusinessCourse {
  id: string;
  title: string;
  instructor: string;
  category: CourseCategory;
  level: CourseLevel;
  description: string;
  price: number;
  duration: number; // Total duration in hours
  modules: CourseModule[];
  thumbnail: string;
  rating: number;
  studentsEnrolled: number;
  featured?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: CourseCategory;
  readTime: number; // in minutes
  thumbnail: string;
  tags: string[];
}

export interface Audiobook {
  id: string;
  title: string;
  narrator: string;
  author: string;
  category: CourseCategory;
  level: CourseLevel;
  description: string;
  price: number;
  duration: number; // Total duration in hours
  chapters: number;
  thumbnail: string;
  rating: number;
  listeners: number;
  featured?: boolean;
  language: 'English' | 'Hindi' | 'Multilingual';
}

export interface WholesalerProduct {
  name: string;
  price: number;
  pricePerUnit: string;
  unit: string;
  stock: number;
}

export interface Wholesaler {
  id: string;
  shopName: string;
  shopNumber: string;
  location: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  contactPerson: string;
  email: string;
  rating: number;
  reviews: number;
  speciality: string;
  products: WholesalerProduct[];
  minOrderQuantity: number;
  deliveryTime: string;
  paymentMethods: string[];
  featured?: boolean;
}

export interface DailyTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  description: string;
  category: string;
  amount: number;
  source?: string; // For income: customer/invoice details
  status: 'completed' | 'pending' | 'failed';
}

export interface DailyTransactionSummary {
  date: string;
  totalIncome: number;
  totalExpense: number;
  incomeCount: number;
  expenseCount: number;
  transactions: DailyTransaction[];
  categoryBreakdown: Record<string, number>; // category -> amount
}
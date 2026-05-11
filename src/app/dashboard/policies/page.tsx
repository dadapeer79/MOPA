'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  CheckCircle2, 
  ArrowRight,
  Briefcase,
  Building2,
  HeartPulse,
  Globe,
  HardHat,
  AlertTriangle
} from 'lucide-react';
import type { BusinessPolicy, PolicyCategory, PolicyDuration } from '@/types/business';

// Dummy data for policies
const policies: BusinessPolicy[] = [
  {
    id: 'health-pro',
    title: 'Health Pro Business Shield',
    category: 'health',
    description: 'Comprehensive health coverage for your employees with dental and vision benefits',
    pricing: {
      monthly: 999,
      yearly: 10789,
      discount: 10
    },
    benefits: [
      {
        icon: 'heart',
        title: 'Medical Coverage',
        description: 'Full coverage for medical emergencies and treatments'
      },
      {
        icon: 'tooth',
        title: 'Dental Care',
        description: 'Basic and major dental procedures covered'
      },
      {
        icon: 'eye',
        title: 'Vision Care',
        description: 'Annual eye exams and prescription glasses'
      }
    ],
    coverage: [
      'Up to ₹5,00,000 per employee',
      'Family coverage included',
      'Pan India hospital network',
      'Cashless claims',
      'Pre-existing conditions covered'
    ],
    popular: true
  },
  {
    id: 'liability-shield',
    title: 'Business Liability Shield',
    category: 'liability',
    description: 'Protect your business from legal claims and liability issues',
    pricing: {
      monthly: 799,
      yearly: 8629,
      discount: 10
    },
    benefits: [
      {
        icon: 'shield',
        title: 'Legal Protection',
        description: 'Coverage for legal expenses and claims'
      },
      {
        icon: 'users',
        title: 'Public Liability',
        description: 'Protection against third-party claims'
      },
      {
        icon: 'building',
        title: 'Property Damage',
        description: 'Coverage for damage to business property'
      }
    ],
    coverage: [
      'Up to ₹1 crore coverage',
      'Legal expenses covered',
      'Professional indemnity',
      'Product liability',
      'Employee compensation'
    ]
  },
  {
    id: 'cyber-secure',
    title: 'Cyber Security Plus',
    category: 'cyber',
    description: 'Digital protection against cyber threats and data breaches',
    pricing: {
      monthly: 1299,
      yearly: 14029,
      discount: 10
    },
    benefits: [
      {
        icon: 'lock',
        title: 'Data Breach Protection',
        description: 'Coverage for data breach incidents'
      },
      {
        icon: 'shield',
        title: 'Cyber Attack Coverage',
        description: 'Protection against cyber attacks'
      },
      {
        icon: 'refresh',
        title: 'Recovery Support',
        description: 'Business recovery and continuity support'
      }
    ],
    coverage: [
      'Up to ₹50,00,000 coverage',
      'Data recovery costs',
      'Business interruption',
      'Cyber extortion',
      'Crisis management'
    ]
  }
];

const categoryIcons: Record<PolicyCategory, React.ReactNode> = {
  health: <HeartPulse className="w-5 h-5" />,
  liability: <AlertTriangle className="w-5 h-5" />,
  property: <Building2 className="w-5 h-5" />,
  cyber: <Globe className="w-5 h-5" />,
  'business-interruption': <Briefcase className="w-5 h-5" />
};

export default function PoliciesPage() {
  const [duration, setDuration] = useState<PolicyDuration>('monthly');

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Business Insurance Policies"
        description="Protect your business with our comprehensive insurance policies tailored for small and medium businesses."
      />

      <div className="flex flex-col gap-6">
        <div className="flex justify-center">
          <Tabs defaultValue="monthly" className="w-[400px]" onValueChange={(v) => setDuration(v as PolicyDuration)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly (10% off)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <Card key={policy.id} className={policy.popular ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <CardTitle className="text-xl">{policy.title}</CardTitle>
                    <CardDescription>{policy.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {categoryIcons[policy.category]}
                    {policy.popular && <Badge variant="default">Popular</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-3xl font-bold">
                    ₹{duration === 'monthly' ? policy.pricing.monthly : policy.pricing.yearly}
                    <span className="text-sm font-normal text-muted-foreground">/{duration}</span>
                  </div>
                  {duration === 'yearly' && policy.pricing.discount && (
                    <div className="text-sm text-green-600 dark:text-green-500">
                      Save {policy.pricing.discount}% with yearly billing
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Coverage Includes
                  </h4>
                  <ul className="space-y-2.5">
                    {policy.coverage.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
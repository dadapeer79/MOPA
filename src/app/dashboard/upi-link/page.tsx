'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';

export default function UpiLinkPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="UPI Link"
        description="Connect your UPI for seamless payments"
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="text-3xl font-bold mb-4">Coming Soon!</h2>
          <p className="text-muted-foreground">
            We&apos;re working on bringing UPI integration to make your payment experience even better.
            Stay tuned!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
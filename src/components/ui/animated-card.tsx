'use client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({ title, icon, children, className, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2 }}
      className="relative perspective-1000"
    >
      <Card className={cn("overflow-hidden", className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && (
            <motion.div
              initial={{ rotate: 0 }}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.3 }}
              className="text-muted-foreground"
            >
              {icon}
            </motion.div>
          )}
        </CardHeader>
        <CardContent className="relative">{children}</CardContent>
        <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-lg" />
      </Card>
    </motion.div>
  );
}
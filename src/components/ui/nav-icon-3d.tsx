'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavIcon3DProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  href?: string;
  className?: string;
}

export function NavIcon3D({ icon, label, isActive, className }: NavIcon3DProps) {
  return (
    <motion.div
      className={cn(
        "relative group flex items-center gap-2 p-2 rounded-lg transition-colors",
        isActive ? "bg-primary/10 text-primary" : "hover:bg-primary/5",
        className
      )}
      whileHover={{ scale: 1.05, rotateX: 10 }}
      whileTap={{ scale: 0.95 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.div
        className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5"
        initial={{ rotateY: 0 }}
        whileHover={{ rotateY: 180 }}
        transition={{ duration: 0.4 }}
      >
        {icon}
      </motion.div>
      <span className="font-medium">{label}</span>
      {isActive && (
        <motion.div
          className="absolute inset-0 border-2 border-primary/20 rounded-lg"
          layoutId="activeNav"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </motion.div>
  );
}
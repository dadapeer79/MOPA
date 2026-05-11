import { motion } from 'framer-motion';
import Image from 'next/image';

interface TeamMemberProps {
  name: string;
  role: string;
  description: string;
  imagePath?: string;
  delay?: number;
}

export function TeamMember({ name, role, description, imagePath, delay = 0 }: TeamMemberProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const colors = [
    { bg: 'bg-blue-500', text: 'text-blue-50' },
    { bg: 'bg-purple-500', text: 'text-purple-50' },
    { bg: 'bg-pink-500', text: 'text-pink-50' },
    { bg: 'bg-teal-500', text: 'text-teal-50' }
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const color = colors[colorIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center p-6 space-y-4 rounded-lg bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`relative w-48 h-48 rounded-full overflow-hidden ${color.bg} flex items-center justify-center shadow-lg`}>
        {imagePath ? (
          <Image
            src={imagePath}
            alt={name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <span className={`text-6xl font-bold ${color.text}`}>
            {initials}
          </span>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: delay + 0.2 }}
        className="text-center space-y-2 w-full"
      >
        <h3 className="text-xl font-bold text-slate-900">{name}</h3>
        <p className="text-lg text-blue-600 font-semibold">{role}</p>
        <p className="text-sm text-slate-600 max-w-sm mx-auto">{description}</p>
      </motion.div>
    </motion.div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface LinkProps {
  href: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function Link({ href, icon: Icon, children, className }: LinkProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <RouterLink
        to={href}
        className={className || "flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium text-sm transition-colors"}
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span>{children}</span>
      </RouterLink>
    </motion.div>
  );
}
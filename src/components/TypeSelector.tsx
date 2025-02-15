import React from 'react';
import { motion } from 'framer-motion';
import { Shirt, Tangent as Pants, Trees as Dress } from 'lucide-react';
import type { ClothingType } from '../types';

interface TypeSelectorProps {
  value: ClothingType;
  onChange: (type: ClothingType) => void;
}

const types = [
  { value: 'tops' as const, icon: Shirt, label: 'Tops' },
  { value: 'bottoms' as const, icon: Pants, label: 'Bottoms' },
  { value: 'one-pieces' as const, icon: Dress, label: 'One Pieces' },
];

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div className="flex justify-center space-x-4">
      {types.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.value;
        
        return (
          <motion.button
            key={type.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(type.value)}
            className={`
              p-4 rounded-lg flex flex-col items-center space-y-2
              backdrop-blur-sm transition-all
              ${isSelected 
                ? 'bg-white shadow-lg border border-blue-200' 
                : 'bg-white/50 hover:bg-white/80'}
            `}
          >
            <Icon className={isSelected ? 'text-blue-500' : 'text-gray-500'} />
            <span className={`text-sm ${isSelected ? 'text-blue-500' : 'text-gray-500'}`}>
              {type.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
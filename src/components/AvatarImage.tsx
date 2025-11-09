import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AvatarImageProps {
  src?: string;
  initials: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-20 w-20',
};

export const AvatarImage = ({
  src,
  initials,
  name,
  size = 'md',
  className,
}: AvatarImageProps) => {
  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        'border-[2.5px] border-border shadow-medium ring-2 ring-border/20 hover:shadow-strong hover:ring-border/40 transition-all duration-200',
        className
      )}
    >
      {src && src.startsWith('http') ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover object-center antialiased transition-transform duration-300 hover:scale-105"
          style={{
            imageRendering: 'smooth',
            WebkitFontSmoothing: 'antialiased',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
        />
      ) : (
        <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg font-semibold">
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

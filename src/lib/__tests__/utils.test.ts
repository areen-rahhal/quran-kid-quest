import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-2', 'py-1');
    expect(result).toBe('px-2 py-1');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('px-2', isActive && 'bg-blue-500');
    expect(result).toContain('px-2');
    expect(result).toContain('bg-blue-500');
  });

  it('should merge conflicting tailwind classes correctly', () => {
    const result = cn('px-2', 'px-4');
    expect(result).toContain('px-4');
    expect(result).not.toContain('px-2');
  });

  it('should handle array inputs', () => {
    const result = cn(['px-2', 'py-1'], 'bg-white');
    expect(result).toContain('px-2');
    expect(result).toContain('py-1');
    expect(result).toContain('bg-white');
  });

  it('should filter out falsy values', () => {
    const result = cn('px-2', false && 'hidden', undefined, 'py-1');
    expect(result).toBe('px-2 py-1');
    expect(result).not.toContain('hidden');
  });

  it('should handle empty inputs', () => {
    const result = cn('');
    expect(result).toBe('');
  });

  it('should handle multiple conflicting responsive classes', () => {
    const result = cn('sm:px-2', 'sm:px-4', 'md:px-6');
    expect(result).toContain('sm:px-4');
    expect(result).toContain('md:px-6');
  });

  it('should preserve non-conflicting classes', () => {
    const result = cn('px-2', 'py-1', 'bg-white', 'text-black');
    expect(result).toContain('px-2');
    expect(result).toContain('py-1');
    expect(result).toContain('bg-white');
    expect(result).toContain('text-black');
  });
});

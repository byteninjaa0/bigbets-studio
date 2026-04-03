import { cn } from '@/lib/utils';

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Standard horizontal shell: max-w-7xl, centered, responsive horizontal padding.
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}>{children}</div>;
}

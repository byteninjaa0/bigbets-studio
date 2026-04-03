import { cn } from '@/lib/utils';
import { PageContainer } from './PageContainer';

type SectionProps = {
  id?: string;
  children: React.ReactNode;
  /** Section wrapper (background, overflow, etc.) */
  className?: string;
  /** Extra classes on the inner PageContainer */
  containerClassName?: string;
};

/**
 * Vertical rhythm: py-12 mobile, py-20 desktop. Content uses PageContainer.
 */
export function Section({ id, children, className, containerClassName }: SectionProps) {
  return (
    <section id={id} className={cn('relative py-12 md:py-20', className)}>
      <PageContainer className={containerClassName}>{children}</PageContainer>
    </section>
  );
}

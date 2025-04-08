import { AnimatedPage } from '@frontend/components/AnimatedPage';
import { Loader2 } from 'lucide-react';

export function Loading({
  className,
  enabled,
  ...props
}: React.ComponentProps<typeof Loader2> & { enabled?: string }) {
  return (
    <AnimatedPage isLoading={true}>
      <div className="h-full flex items-center justify-center bg-background">
        <Loader2
          className={`h-8 w-8 animate-spin text-gray-600 ${className}`}
          {...props}
        />
      </div>
    </AnimatedPage>
  );
}

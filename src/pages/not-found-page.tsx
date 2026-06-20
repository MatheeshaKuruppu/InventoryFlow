import { Link } from 'react-router-dom';
import { Compass, MoveLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/10 text-primary">
        <Compass className="size-7" />
      </div>
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="mt-6 gap-2">
        <Link to="/">
          <MoveLeft className="size-4" />
          Back to dashboard
        </Link>
      </Button>
    </div>
  );
}

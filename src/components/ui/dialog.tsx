import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

type DialogSide = 'center' | 'left';

/**
 * Motion owns the transform here. Because Framer Motion writes an inline
 * `transform`, it would override Tailwind's `-translate-*` centering classes —
 * so the centering offset (`x/y: -50%`) lives in the animation itself.
 */
const SIDE_CONFIG: Record<
  DialogSide,
  { className: string; initial: object; animate: object }
> = {
  center: {
    className:
      'left-1/2 top-1/2 grid max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg gap-4 overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl',
    initial: { opacity: 0, scale: 0.96, x: '-50%', y: '-48%' },
    animate: { opacity: 1, scale: 1, x: '-50%', y: '-50%' },
  },
  left: {
    className:
      'left-0 top-0 flex h-full w-full max-w-sm flex-col border-r border-border bg-card shadow-2xl',
    initial: { opacity: 0, x: '-100%' },
    animate: { opacity: 1, x: '0%' },
  },
};

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideClose?: boolean;
    side?: DialogSide;
  }
>(({ className, children, hideClose, side = 'center', ...props }, ref) => {
  const config = SIDE_CONFIG[side];
  return (
    <DialogPortal>
      <DialogOverlay />
      {/* asChild lets Framer Motion drive the animation without prop-type clashes. */}
      <DialogPrimitive.Content ref={ref} asChild {...props}>
        <motion.div
          initial={config.initial}
          animate={config.animate}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={cn('fixed z-50', config.className, className)}
        >
          {children}
          {!hideClose && (
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground opacity-70 ring-offset-background transition-opacity hover:bg-accent hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none">
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 text-left', className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

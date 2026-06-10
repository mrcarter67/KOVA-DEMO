import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-primary text-primary-foreground",
        secondary:   "border-transparent bg-secondary text-secondary-foreground",
        success:     "border-transparent bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]",
        warning:     "border-transparent bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
        destructive: "border-transparent bg-[#FEF2F2] text-[#B91C1C]",
        outline:     "text-foreground",
        accent:      "border-transparent bg-[#00C896]/10 text-[#00C896]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

import { motion } from 'framer-motion';
import { Boxes, FolderTree, MoreHorizontal, Package, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CategoryWithStats } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCompactCurrency, formatNumber } from '@/utils/format';

interface CategoryCardProps {
  category: CategoryWithStats;
  index: number;
  onEdit: (category: CategoryWithStats) => void;
  onDelete: (category: CategoryWithStats) => void;
}

export function CategoryCard({ category, index, onEdit, onDelete }: CategoryCardProps) {
  const hasProducts = category.productCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Card className="group flex h-full flex-col p-5 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-violet-500/10 text-primary">
            <FolderTree className="size-5" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                aria-label={`Actions for ${category.name}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onEdit(category)}>
                <Pencil className="size-4" /> Edit category
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {hasProducts ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <DropdownMenuItem disabled className="cursor-not-allowed">
                        <Trash2 className="size-4" /> Delete
                      </DropdownMenuItem>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Reassign or remove its products first</TooltipContent>
                </Tooltip>
              ) : (
                <DropdownMenuItem destructive onClick={() => onDelete(category)}>
                  <Trash2 className="size-4" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex-1">
          <h3 className="font-semibold text-foreground">{category.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {category.description || 'No description provided.'}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
          <div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Package className="size-3.5" /> Products
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
              {formatNumber(category.productCount)}
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Boxes className="size-3.5" /> Value
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
              {formatCompactCurrency(category.inventoryValue)}
            </p>
          </div>
        </div>

        {hasProducts ? (
          <Button asChild variant="ghost" size="sm" className="mt-3 w-full justify-center">
            <Link to={`/products?category=${category.id}`}>View products</Link>
          </Button>
        ) : (
          <Badge variant="secondary" className="mt-3 justify-center py-1">
            Empty category
          </Badge>
        )}
      </Card>
    </motion.div>
  );
}

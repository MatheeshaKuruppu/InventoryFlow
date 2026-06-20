import { LayoutDashboard, Package, FolderTree, Boxes, Settings, type LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, description: 'Analytics & overview' },
  { label: 'Products', to: '/products', icon: Package, description: 'Manage your catalog' },
  { label: 'Categories', to: '/categories', icon: FolderTree, description: 'Organize products' },
  { label: 'Stock', to: '/stock', icon: Boxes, description: 'Inventory operations' },
  { label: 'Settings', to: '/settings', icon: Settings, description: 'Appearance & data' },
];

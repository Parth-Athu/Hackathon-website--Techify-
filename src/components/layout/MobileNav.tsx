import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Palette, ShoppingCart, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Shop', href: '/shop' },
    { icon: Palette, label: 'Sell', href: '/sell' },
    { icon: ShoppingCart, label: 'Cart', href: '/cart' },
    { icon: Menu, label: 'Menu', href: '/menu' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t lg:hidden">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            to={href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 text-xs transition-colors",
              location.pathname === href
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { FileText, Package, BarChart3, Eye, Users } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 print:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <FileText className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold text-foreground">Mobile Shop Manager</h1>
              </div>
            </Link>
            
            <div className="flex gap-2 flex-wrap">
              <Link href="/">
                <Button 
                  variant={location === '/' ? 'default' : 'outline'} 
                  size="sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  New Invoice
                </Button>
              </Link>
              <Link href="/invoices">
                <Button 
                  variant={location === '/invoices' || location.startsWith('/invoice/') ? 'default' : 'outline'} 
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Invoices
                </Button>
              </Link>
              <Link href="/inventory">
                <Button 
                  variant={location === '/inventory' ? 'default' : 'outline'} 
                  size="sm"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Inventory
                </Button>
              </Link>
              <Link href="/customers">
                <Button 
                  variant={location === '/customers' ? 'default' : 'outline'} 
                  size="sm"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Customers
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button 
                  variant={location === '/dashboard' ? 'default' : 'outline'} 
                  size="sm"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main>
        {children}
      </main>
    </div>
  );
}

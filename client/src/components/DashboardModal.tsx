import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  totalRevenue: number;
  totalProfit: number;
  lowStockItems: number;
  invoicesToday: number;
}

interface LowStockItem {
  id: string;
  name: string;
  stockQuantity: number;
  reorderLevel: number;
}

interface DashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: DashboardStats;
  lowStockItems: LowStockItem[];
}

export default function DashboardModal({ open, onOpenChange, stats, lowStockItems }: DashboardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Business Dashboard</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-revenue">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Overall sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2" data-testid="text-total-profit">${stats.totalProfit.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Net earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Invoices Today</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-invoices-today">{stats.invoicesToday}</div>
              <p className="text-xs text-muted-foreground">Transactions made</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.lowStockItems > 0 ? 'text-destructive' : 'text-chart-2'}`} data-testid="text-low-stock-count">
                {stats.lowStockItems}
              </div>
              <p className="text-xs text-muted-foreground">Items need reorder</p>
            </CardContent>
          </Card>
        </div>

        {lowStockItems.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Low Stock Items
            </h3>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 border border-destructive/30 bg-destructive/5 rounded-lg"
                  data-testid={`low-stock-${item.id}`}
                >
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Stock: {item.stockQuantity} • Reorder at: {item.reorderLevel}
                    </div>
                  </div>
                  <Badge variant="destructive">Low Stock</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

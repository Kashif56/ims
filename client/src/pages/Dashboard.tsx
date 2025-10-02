import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/context/AppContext';
import Layout from '@/components/Layout';
import { DateRangePicker } from '@/components/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

export default function DashboardPage() {
  const { savedInvoices, inventory } = useAppContext();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Filter invoices based on date range
  const filteredInvoices = useMemo(() => {
    if (!dateRange?.from) {
      return savedInvoices;
    }

    return savedInvoices.filter((invoice) => {
      const invoiceDate = parseISO(invoice.date);
      const from = startOfDay(dateRange.from!);
      const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from!);

      return isWithinInterval(invoiceDate, { start: from, end: to });
    });
  }, [savedInvoices, dateRange]);

  const stats = {
    totalRevenue: filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0),
    totalProfit: filteredInvoices.reduce((sum, inv) => sum + (inv.total_amount * 0.15), 0),
    invoicesToday: filteredInvoices.filter(inv => inv.date === new Date().toISOString().split('T')[0]).length,
    lowStockItems: inventory.filter(item => item.stock_quantity < item.reorder_level).length,
  };

  const lowStockItems = inventory.filter(item => item.stock_quantity < item.reorder_level);
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Overview of your business metrics
                {dateRange?.from && (
                  <span className="ml-2 text-sm">
                    ({filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} in selected range)
                  </span>
                )}
              </p>
            </div>
            <div className="w-full sm:w-auto sm:min-w-[300px]">
              <DateRangePicker date={dateRange} onDateChange={setDateRange} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-revenue">Rs. {stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{dateRange?.from ? 'Sales in selected period' : 'Overall sales'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2" data-testid="text-total-profit">Rs. {stats.totalProfit.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{dateRange?.from ? 'Earnings in selected period' : 'Net earnings'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Invoices Today</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-invoices-today">{stats.invoicesToday}</div>
              <p className="text-xs text-muted-foreground">{dateRange?.from ? 'Invoices in selected period' : 'Transactions made'}</p>
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
          <div className="bg-card border rounded-lg shadow-lg p-6">
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
                      Stock: {item.stock_quantity} • Reorder at: {item.reorder_level}
                    </div>
                  </div>
                  <Badge variant="destructive">Low Stock</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

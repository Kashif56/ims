import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrendingUp, Package, DollarSign, Percent, Calendar, X } from 'lucide-react';
import { getProfitByProduct } from '@/lib/supabaseService';
import { useToast } from '@/hooks/use-toast';

interface ProductProfit {
  item_name: string;
  totalQuantity: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  transactionCount: number;
}

export default function ProfitAnalysis() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductProfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchProfitData();
  }, []);

  const fetchProfitData = async (start?: string, end?: string) => {
    try {
      setLoading(true);
      const data = await getProfitByProduct(start, end);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching profit data:', error);
      toast({
        title: "Error",
        description: "Failed to load profit analysis data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      toast({
        title: "Invalid Date Range",
        description: "Start date must be before end date.",
        variant: "destructive",
      });
      return;
    }
    fetchProfitData(startDate || undefined, endDate || undefined);
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    fetchProfitData();
  };

  const totalRevenue = products.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalCost = products.reduce((sum, p) => sum + p.totalCost, 0);
  const totalProfit = products.reduce((sum, p) => sum + p.totalProfit, 0);
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            Profit Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            View profit breakdown by product
          </p>
        </div>

        {/* Date Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleApplyFilter} disabled={loading}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Apply Filter
                </Button>
                <Button 
                  onClick={handleClearFilter} 
                  variant="outline" 
                  disabled={loading || (!startDate && !endDate)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
            {(startDate || endDate) && (
              <div className="mt-3 text-sm text-muted-foreground">
                Showing data {startDate ? `from ${new Date(startDate).toLocaleDateString()}` : ''}
                {startDate && endDate ? ' ' : ''}
                {endDate ? `to ${new Date(endDate).toLocaleDateString()}` : ''}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold">
                  Rs. {totalRevenue.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-orange-500" />
                <span className="text-2xl font-bold">
                  Rs. {totalCost.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold text-green-600">
                  Rs. {totalProfit.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Profit Margin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-purple-500" />
                <span className="text-2xl font-bold">
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Profit Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading profit data...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No sales data available yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Product Name</th>
                      <th className="text-right py-3 px-4 font-semibold">Qty Sold</th>
                      <th className="text-right py-3 px-4 font-semibold">Transactions</th>
                      <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                      <th className="text-right py-3 px-4 font-semibold">Cost</th>
                      <th className="text-right py-3 px-4 font-semibold">Profit</th>
                      <th className="text-right py-3 px-4 font-semibold">Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => {
                      const margin = product.totalRevenue > 0 
                        ? (product.totalProfit / product.totalRevenue) * 100 
                        : 0;
                      
                      return (
                        <tr 
                          key={index} 
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium">{product.item_name}</td>
                          <td className="py-3 px-4 text-right">{product.totalQuantity}</td>
                          <td className="py-3 px-4 text-right">{product.transactionCount}</td>
                          <td className="py-3 px-4 text-right text-blue-600 font-semibold">
                            Rs. {product.totalRevenue.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right text-orange-600">
                            Rs. {product.totalCost.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right text-green-600 font-bold">
                            Rs. {product.totalProfit.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-semibold ${
                              margin >= 30 ? 'text-green-600' :
                              margin >= 15 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {margin.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-bold bg-muted/30">
                      <td className="py-3 px-4">TOTAL</td>
                      <td className="py-3 px-4 text-right">
                        {products.reduce((sum, p) => sum + p.totalQuantity, 0)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {products.reduce((sum, p) => sum + p.transactionCount, 0)}
                      </td>
                      <td className="py-3 px-4 text-right text-blue-600">
                        Rs. {totalRevenue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-orange-600">
                        Rs. {totalCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-green-600">
                        Rs. {totalProfit.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {profitMargin.toFixed(1)}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

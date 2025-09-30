import { useState } from 'react';
import DashboardModal from '../DashboardModal';
import { Button } from '@/components/ui/button';

export default function DashboardModalExample() {
  const [open, setOpen] = useState(false);

  const stats = {
    totalRevenue: 58432.50,
    totalProfit: 12850.75,
    invoicesToday: 12,
    lowStockItems: 2,
  };

  const lowStockItems = [
    { id: '2', name: 'Samsung Galaxy S24 Ultra', stockQuantity: 5, reorderLevel: 10 },
    { id: '4', name: 'AirPods Pro Gen 3', stockQuantity: 3, reorderLevel: 15 },
  ];

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Dashboard</Button>
      <DashboardModal
        open={open}
        onOpenChange={setOpen}
        stats={stats}
        lowStockItems={lowStockItems}
      />
    </div>
  );
}

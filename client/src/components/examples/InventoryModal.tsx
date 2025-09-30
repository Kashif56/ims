import { useState } from 'react';
import InventoryModal from '../InventoryModal';
import { Button } from '@/components/ui/button';

export default function InventoryModalExample() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { id: '1', name: 'iPhone 15 Pro Max 256GB', sku: 'IPH15PM256', costPrice: 1100, stockQuantity: 15, reorderLevel: 10 },
    { id: '2', name: 'Samsung Galaxy S24 Ultra', sku: 'SGS24U', costPrice: 1000, stockQuantity: 5, reorderLevel: 10 },
    { id: '3', name: 'Google Pixel 8 Pro', sku: 'GPX8P', costPrice: 850, stockQuantity: 12, reorderLevel: 10 },
  ]);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Inventory Manager</Button>
      <InventoryModal
        open={open}
        onOpenChange={setOpen}
        items={items}
        onAddItem={(item) => setItems([...items, { ...item, id: Date.now().toString() }])}
        onUpdateItem={(id, item) => setItems(items.map(i => i.id === id ? { ...item, id } : i))}
        onDeleteItem={(id) => setItems(items.filter(i => i.id !== id))}
      />
    </div>
  );
}

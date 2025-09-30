import { useState } from 'react';
import InvoiceLineItems from '../InvoiceLineItems';

export default function InvoiceLineItemsExample() {
  const [items, setItems] = useState([
    { id: '1', itemId: '1', name: 'iPhone 15 Pro Max 256GB', quantity: 2, salePrice: 1299.99, costPrice: 1100 },
    { id: '2', itemId: '2', name: 'Samsung Galaxy S24 Ultra', quantity: 1, salePrice: 1199.99, costPrice: 1000 },
  ]);

  const inventory = [
    { id: '1', name: 'iPhone 15 Pro Max 256GB', costPrice: 1100, stockQuantity: 15 },
    { id: '2', name: 'Samsung Galaxy S24 Ultra', costPrice: 1000, stockQuantity: 8 },
    { id: '3', name: 'Google Pixel 8 Pro', costPrice: 850, stockQuantity: 12 },
  ];

  return (
    <InvoiceLineItems
      items={items}
      inventory={inventory}
      onAddItem={(item) => setItems([...items, item])}
      onUpdateItem={(id, item) => setItems(items.map(i => i.id === id ? item : i))}
      onRemoveItem={(id) => setItems(items.filter(i => i.id !== id))}
    />
  );
}

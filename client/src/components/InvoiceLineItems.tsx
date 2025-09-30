import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  costPrice: number;
  stockQuantity: number;
}

interface LineItem {
  id: string;
  itemId: string;
  name: string;
  quantity: number;
  salePrice: number;
  costPrice: number;
}

interface InvoiceLineItemsProps {
  items: LineItem[];
  inventory: InventoryItem[];
  onAddItem: (item: LineItem) => void;
  onUpdateItem: (id: string, item: LineItem) => void;
  onRemoveItem: (id: string) => void;
}

export default function InvoiceLineItems({ items, inventory, onAddItem, onUpdateItem, onRemoveItem }: InvoiceLineItemsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newItem, setNewItem] = useState({ quantity: 1, salePrice: 0 });

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectItem = (invItem: InventoryItem) => {
    const lineItem: LineItem = {
      id: Date.now().toString(),
      itemId: invItem.id,
      name: invItem.name,
      quantity: newItem.quantity,
      salePrice: newItem.salePrice || invItem.costPrice * 1.2,
      costPrice: invItem.costPrice,
    };
    onAddItem(lineItem);
    setSearchQuery('');
    setShowSuggestions(false);
    setNewItem({ quantity: 1, salePrice: 0 });
  };

  return (
    <div className="mb-6">
      <h3 className="font-semibold text-lg mb-3">Invoice Items</h3>
      
      <div className="mb-4 p-4 bg-muted rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search item by name..."
              data-testid="input-item-search"
            />
            {showSuggestions && searchQuery && (
              <div className="absolute z-50 w-full mt-2 bg-popover border border-popover-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredInventory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="p-3 hover-elevate cursor-pointer border-b border-border last:border-0"
                    data-testid={`item-option-${item.id}`}
                  >
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-muted-foreground">Stock: {item.stockQuantity} • Cost: ${item.costPrice.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Input
            type="number"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
            placeholder="Qty"
            min="1"
            data-testid="input-item-quantity"
          />
          <Input
            type="number"
            value={newItem.salePrice}
            onChange={(e) => setNewItem({ ...newItem, salePrice: parseFloat(e.target.value) || 0 })}
            placeholder="Sale Price"
            step="0.01"
            data-testid="input-item-price"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-semibold text-sm">Item Description</th>
              <th className="text-center p-3 font-semibold text-sm">Qty</th>
              <th className="text-right p-3 font-semibold text-sm">Unit Price</th>
              <th className="text-right p-3 font-semibold text-sm">Total</th>
              <th className="text-center p-3 font-semibold text-sm print:hidden">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-6 text-muted-foreground">
                  No items added yet. Search and add items above.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t" data-testid={`line-item-${item.id}`}>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right">${item.salePrice.toFixed(2)}</td>
                  <td className="p-3 text-right font-semibold">${(item.quantity * item.salePrice).toFixed(2)}</td>
                  <td className="p-3 text-center print:hidden">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onRemoveItem(item.id)}
                      data-testid={`button-remove-${item.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

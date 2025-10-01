import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  cost_price: number;
  stock_quantity: number;
}

interface LineItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  sale_price: number;
  cost_price: number;
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
      item_id: invItem.id,
      item_name: invItem.name,
      quantity: newItem.quantity,
      sale_price: newItem.salePrice || invItem.cost_price * 1.2,
      cost_price: invItem.cost_price,
    };
    onAddItem(lineItem);
    setSearchQuery('');
    setShowSuggestions(false);
    setNewItem({ quantity: 1, salePrice: 0 });
  };

  return (
    <div className="mb-6">
      <h3 className="font-semibold text-lg mb-3">Invoice Items</h3>
      
      <div className="mb-4 p-4 bg-muted rounded-lg border print:hidden">
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
                    <div className="text-sm text-muted-foreground">Stock: {item.stock_quantity} • Cost: Rs. {item.cost_price.toFixed(2)}</div>
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
            className="text-center"
            data-testid="input-item-quantity"
          />
          <Input
            type="number"
            value={newItem.salePrice}
            onChange={(e) => setNewItem({ ...newItem, salePrice: parseFloat(e.target.value) || 0 })}
            placeholder="Sale Price"
            step="0.01"
            className="text-center"
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
                  <td className="p-3">{item.item_name}</td>
                  <td className="p-3">
                    <div className="flex justify-center">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => onUpdateItem(item.id, { ...item, quantity: parseInt(e.target.value) || 1 })}
                        min="1"
                        className="w-20 text-center border-0 bg-transparent hover:bg-muted focus:bg-muted transition-colors print:hidden"
                      />
                      <span className="hidden print:inline">{item.quantity}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end">
                      <Input
                        type="number"
                        value={item.sale_price}
                        onChange={(e) => onUpdateItem(item.id, { ...item, sale_price: parseFloat(e.target.value) || 0 })}
                        step="0.01"
                        min="0"
                        className="w-28 text-right border-0 bg-transparent hover:bg-muted focus:bg-muted transition-colors print:hidden"
                      />
                      <span className="hidden print:inline">Rs. {item.sale_price.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-semibold">Rs. {(item.quantity * item.sale_price).toFixed(2)}</td>
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

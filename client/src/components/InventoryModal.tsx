import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, PackagePlus, Pencil, Trash2, X } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  retailPrice: number;
  stockQuantity: number;
  reorderLevel: number;
}

interface InventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
  onUpdateItem: (id: string, item: Omit<InventoryItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
}

export default function InventoryModal({ open, onOpenChange, items, onAddItem, onUpdateItem, onDeleteItem }: InventoryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    costPrice: 0,
    retailPrice: 0,
    stockQuantity: 0,
    reorderLevel: 10,
  });

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    if (editingId) {
      onUpdateItem(editingId, formData);
    } else {
      onAddItem(formData);
    }
    setFormData({ name: '', sku: '', costPrice: 0, retailPrice: 0, stockQuantity: 0, reorderLevel: 10 });
    setEditingId(null);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      sku: item.sku,
      costPrice: item.costPrice,
      retailPrice: item.retailPrice,
      stockQuantity: item.stockQuantity,
      reorderLevel: item.reorderLevel,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', sku: '', costPrice: 0, retailPrice: 0, stockQuantity: 0, reorderLevel: 10 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Shop Inventory Management</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          <div className="p-4 border rounded-lg bg-muted space-y-3">
            <h4 className="font-semibold text-lg">{editingId ? 'Update Item' : 'Add New Item'}</h4>
            
            <div>
              <Label htmlFor="itemName">Item Name/Description</Label>
              <Input
                id="itemName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., iPhone 15 Pro Max"
                data-testid="input-inventory-name"
              />
            </div>

            <div>
              <Label htmlFor="itemSku">SKU</Label>
              <Input
                id="itemSku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Stock Keeping Unit"
                data-testid="input-inventory-sku"
              />
            </div>

            <div>
              <Label htmlFor="itemCost">Wholesale Cost</Label>
              <Input
                id="itemCost"
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                step="0.01"
                data-testid="input-inventory-cost"
              />
            </div>

            <div>
              <Label htmlFor="itemRetail">Retail Price</Label>
              <Input
                id="itemRetail"
                type="number"
                value={formData.retailPrice}
                onChange={(e) => setFormData({ ...formData, retailPrice: parseFloat(e.target.value) || 0 })}
                step="0.01"
                data-testid="input-inventory-retail"
              />
            </div>

            <div>
              <Label htmlFor="itemStock">Stock Quantity</Label>
              <Input
                id="itemStock"
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                data-testid="input-inventory-stock"
              />
            </div>

            <div>
              <Label htmlFor="itemReorder">Reorder Level</Label>
              <Input
                id="itemReorder"
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 10 })}
                data-testid="input-inventory-reorder"
              />
            </div>

            {editingId && (
              <Button size="sm" variant="secondary" onClick={handleCancel} className="w-full" data-testid="button-cancel-edit-inventory">
                <X className="w-4 h-4 mr-2" />
                Cancel Edit
              </Button>
            )}

            <Button onClick={handleSave} className="w-full" data-testid="button-save-inventory">
              <PackagePlus className="w-5 h-5 mr-2" />
              {editingId ? 'Update Item' : 'Add to Stock'}
            </Button>
          </div>

          <div className="lg:col-span-2 p-4 border rounded-lg bg-card flex flex-col">
            <h4 className="font-semibold text-lg mb-3">Current Stock List</h4>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or SKU..."
                className="pl-10"
                data-testid="input-inventory-search"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 border rounded-lg hover-elevate ${item.stockQuantity < item.reorderLevel ? 'border-destructive bg-destructive/5' : ''} ${editingId === item.id ? 'border-primary bg-primary/5' : ''}`}
                  data-testid={`inventory-item-${item.id}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
                      <div className="text-sm mt-1">
                        <span>Stock: </span>
                        <span className={`font-semibold ${item.stockQuantity < item.reorderLevel ? 'text-destructive' : 'text-chart-2'}`}>
                          {item.stockQuantity}
                        </span>
                        <span className="text-muted-foreground"> • Cost: Rs. {item.costPrice.toFixed(2)} • Retail: Rs. {item.retailPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(item)} data-testid={`button-edit-${item.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onDeleteItem(item.id)} data-testid={`button-delete-${item.id}`}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

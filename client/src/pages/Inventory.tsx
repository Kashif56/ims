import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, PackagePlus, Pencil, Trash2, X, Package, DollarSign } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { createInventoryItem, updateInventoryItem, deleteInventoryItem } from '@/lib/supabaseService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  cost_price: number;
  retail_price: number;
  stock_quantity: number;
  reorder_level: number;
}

export default function InventoryPage() {
  const { inventory, setInventory } = useAppContext();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    cost_price: 0,
    retail_price: 0,
    stock_quantity: 0,
    reorder_level: 10,
  });

  const filteredItems = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate inventory statistics
  const inventoryStats = useMemo(() => {
    const totalSKUs = inventory.length;
    const totalValueAtCost = inventory.reduce((sum, item) => {
      return sum + (item.cost_price * item.stock_quantity);
    }, 0);
    const totalValueAtRetail = inventory.reduce((sum, item) => {
      return sum + (item.retail_price * item.stock_quantity);
    }, 0);
    return { totalSKUs, totalValueAtCost, totalValueAtRetail };
  }, [inventory]);

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateInventoryItem(editingId, formData);
        setInventory(inventory.map(i => i.id === editingId ? { ...formData, id: editingId } : i));
        toast({
          title: "Item Updated",
          description: "Inventory item has been updated.",
        });
      } else {
        const newItem = await createInventoryItem(formData);
        setInventory([...inventory, newItem]);
        toast({
          title: "Item Added",
          description: `${formData.name} has been added to inventory.`,
        });
      }
      setFormData({ name: '', sku: '', cost_price: 0, retail_price: 0, stock_quantity: 0, reorder_level: 10 });
      setEditingId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save item",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInventoryItem(id);
      setInventory(inventory.filter(i => i.id !== id));
      toast({
        title: "Item Deleted",
        description: "Item has been removed from inventory.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      sku: item.sku,
      cost_price: item.cost_price,
      retail_price: item.retail_price,
      stock_quantity: item.stock_quantity,
      reorder_level: item.reorder_level,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', sku: '', cost_price: 0, retail_price: 0, stock_quantity: 0, reorder_level: 10 });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryStats.totalSKUs}</div>
              <p className="text-xs text-muted-foreground">
                Unique products in inventory
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value (Cost)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. {inventoryStats.totalValueAtCost.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                Total value at wholesale cost
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value (Retail)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. {inventoryStats.totalValueAtRetail.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground">
                Total value at retail price
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg bg-card shadow-lg space-y-3">
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
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                step="0.01"
                data-testid="input-inventory-cost"
              />
            </div>

            <div>
              <Label htmlFor="itemRetail">Retail Price</Label>
              <Input
                id="itemRetail"
                type="number"
                value={formData.retail_price}
                onChange={(e) => setFormData({ ...formData, retail_price: parseFloat(e.target.value) || 0 })}
                step="0.01"
                data-testid="input-inventory-retail"
              />
            </div>

            <div>
              <Label htmlFor="itemStock">Stock Quantity</Label>
              <Input
                id="itemStock"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                data-testid="input-inventory-stock"
              />
            </div>

            <div>
              <Label htmlFor="itemReorder">Reorder Level</Label>
              <Input
                id="itemReorder"
                type="number"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 10 })}
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

          <div className="lg:col-span-2 p-6 border rounded-lg bg-card shadow-lg flex flex-col">
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
                  className={`p-3 border rounded-lg hover-elevate ${item.stock_quantity < item.reorder_level ? 'border-destructive bg-destructive/5' : ''} ${editingId === item.id ? 'border-primary bg-primary/5' : ''}`}
                  data-testid={`inventory-item-${item.id}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
                      <div className="text-sm mt-1">
                        <span>Stock: </span>
                        <span className={`font-semibold ${item.stock_quantity < item.reorder_level ? 'text-destructive' : 'text-chart-2'}`}>
                          {item.stock_quantity}
                        </span>
                        <span className="text-muted-foreground"> • Cost: Rs. {item.cost_price.toFixed(2)} • Retail: Rs. {item.retail_price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(item)} data-testid={`button-edit-${item.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} data-testid={`button-delete-${item.id}`}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

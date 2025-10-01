import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  UserPlus, 
  Pencil, 
  Trash2, 
  X, 
  LayoutGrid, 
  List, 
  Phone, 
  MapPin, 
  DollarSign,
  User
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { createCustomer, updateCustomer, deleteCustomer } from '@/lib/supabaseService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  current_due: number;
}

type ViewMode = 'list' | 'card';

export default function CustomersPage() {
  const { customers, setCustomers } = useAppContext();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    current_due: 0,
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      toast({
        title: "Validation Error",
        description: "Name and phone are required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingId) {
        await updateCustomer(editingId, formData);
        setCustomers(customers.map(c => c.id === editingId ? { ...formData, id: editingId } : c));
        toast({
          title: "Customer Updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        const newCustomer = await createCustomer(formData);
        setCustomers([...customers, newCustomer]);
        toast({
          title: "Customer Added",
          description: `${formData.name} has been added successfully.`,
        });
      }
      setFormData({ name: '', phone: '', address: '', current_due: 0 });
      setEditingId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save customer",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    try {
      await deleteCustomer(customerToDelete.id);
      setCustomers(customers.filter(c => c.id !== customerToDelete.id));
      toast({
        title: "Customer Deleted",
        description: `${customerToDelete.name} has been removed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete customer",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      current_due: customer.current_due,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '', address: '', current_due: 0 });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Customers</h2>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add/Edit Customer Form */}
          <div className="p-6 border rounded-lg bg-card shadow-lg space-y-4 h-fit sticky top-20">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-lg">
                {editingId ? 'Update Customer' : 'Add New Customer'}
              </h4>
            </div>
            
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., John Doe"
                data-testid="input-customer-name"
              />
            </div>

            <div>
              <Label htmlFor="customerPhone">Phone Number *</Label>
              <Input
                id="customerPhone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g., +92 300 1234567"
                data-testid="input-customer-phone"
              />
            </div>

            <div>
              <Label htmlFor="customerAddress">Address</Label>
              <Input
                id="customerAddress"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g., 123 Main Street"
                data-testid="input-customer-address"
              />
            </div>

            <div>
              <Label htmlFor="customerDue">Current Due (Rs.)</Label>
              <Input
                id="customerDue"
                type="number"
                value={formData.current_due}
                onChange={(e) => setFormData({ ...formData, current_due: parseFloat(e.target.value) || 0 })}
                step="0.01"
                data-testid="input-customer-due"
              />
            </div>

            {editingId && (
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={handleCancel} 
                className="w-full" 
                data-testid="button-cancel-edit-customer"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Edit
              </Button>
            )}

            <Button 
              onClick={handleSave} 
              className="w-full" 
              data-testid="button-save-customer"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {editingId ? 'Update Customer' : 'Add Customer'}
            </Button>
          </div>

          {/* Customer List/Grid */}
          <div className="lg:col-span-2 p-6 border rounded-lg bg-card shadow-lg flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <h4 className="font-semibold text-lg">
                Customer List ({filteredCustomers.length})
              </h4>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                  data-testid="button-view-card"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  data-testid="button-view-list"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, or address..."
                className="pl-10"
                data-testid="input-customer-search"
              />
            </div>

            {filteredCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <User className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No customers found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search' : 'Add your first customer to get started'}
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {viewMode === 'card' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className={`p-4 border rounded-lg hover-elevate transition-all ${
                          editingId === customer.id ? 'border-primary bg-primary/5 shadow-md' : ''
                        } ${customer.current_due > 0 ? 'border-l-4 border-l-amber-500' : ''}`}
                        data-testid={`customer-card-${customer.id}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-foreground">{customer.name}</h5>
                              {customer.current_due > 0 && (
                                <span className="text-xs text-amber-600 font-medium">
                                  Due: Rs. {customer.current_due.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleEdit(customer)} 
                              data-testid={`button-edit-${customer.id}`}
                            >
                              <Pencil className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleDeleteClick(customer)} 
                              data-testid={`button-delete-${customer.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{customer.phone}</span>
                          </div>
                          {customer.address && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span className="line-clamp-1">{customer.address}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="w-4 h-4" />
                            <span className={customer.current_due > 0 ? 'text-amber-600 font-semibold' : ''}>
                              Balance: Rs. {customer.current_due.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className={`p-4 border rounded-lg hover-elevate transition-all ${
                          editingId === customer.id ? 'border-primary bg-primary/5' : ''
                        } ${customer.current_due > 0 ? 'border-l-4 border-l-amber-500' : ''}`}
                        data-testid={`customer-list-${customer.id}`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-foreground mb-1">{customer.name}</h5>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{customer.phone}</span>
                                </div>
                                {customer.address && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">{customer.address}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  <span className={customer.current_due > 0 ? 'text-amber-600 font-semibold' : ''}>
                                    Rs. {customer.current_due.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleEdit(customer)} 
                              data-testid={`button-edit-list-${customer.id}`}
                            >
                              <Pencil className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleDeleteClick(customer)} 
                              data-testid={`button-delete-list-${customer.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{customerToDelete?.name}</strong> from your customer database.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

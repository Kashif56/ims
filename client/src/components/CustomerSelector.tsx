import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  currentDue: number;
}

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  onCreateCustomer: (customer: Omit<Customer, 'id' | 'currentDue'>) => void;
}

export default function CustomerSelector({ customers, selectedCustomer, onSelectCustomer, onCreateCustomer }: CustomerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const handleSelect = (customer: Customer) => {
    onSelectCustomer(customer);
    setSearchQuery('');
    setShowResults(false);
    setShowCreateForm(false);
  };

  const handleCreate = () => {
    if (newCustomer.name && newCustomer.phone) {
      onCreateCustomer(newCustomer);
      setNewCustomer({ name: '', phone: '', address: '' });
      setShowCreateForm(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="mb-6">
      <Label className="mb-2 block font-semibold">Customer Information</Label>
      
      {!selectedCustomer ? (
        <div className="relative print:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
                setShowCreateForm(false);
              }}
              placeholder="Search customer by name or phone..."
              className="pl-10"
              data-testid="input-customer-search"
            />
          </div>

          {showResults && searchQuery && (
            <div className="absolute z-50 w-full mt-2 bg-popover border border-popover-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleSelect(customer)}
                    className="p-3 hover-elevate cursor-pointer border-b border-border last:border-0"
                    data-testid={`customer-option-${customer.id}`}
                  >
                    <div className="font-semibold text-foreground">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">{customer.phone} • Due: Rs. {(customer.currentDue || 0).toFixed(2)}</div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-muted-foreground mb-3">No customer found</p>
                  <Button size="sm" onClick={() => { setShowCreateForm(true); setShowResults(false); }} data-testid="button-create-customer">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Customer
                  </Button>
                </div>
              )}
            </div>
          )}

          {showCreateForm && (
            <div className="mt-4 p-4 bg-muted rounded-lg border">
              <h3 className="font-semibold mb-3">Create New Customer</h3>
              <Input
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                placeholder="Customer Name"
                className="mb-2"
                data-testid="input-new-customer-name"
              />
              <Input
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="Phone Number"
                className="mb-2"
                data-testid="input-new-customer-phone"
              />
              <Input
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                placeholder="Address (Optional)"
                className="mb-3"
                data-testid="input-new-customer-address"
              />
              <div className="flex gap-2">
                <Button onClick={handleCreate} size="sm" data-testid="button-save-customer">Save Customer</Button>
                <Button onClick={() => setShowCreateForm(false)} size="sm" variant="secondary" data-testid="button-cancel-customer">Cancel</Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-muted rounded-lg border">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-lg" data-testid="text-selected-customer-name">{selectedCustomer.name}</div>
              <div className="text-sm text-muted-foreground">{selectedCustomer.phone}</div>
              <div className="text-sm text-muted-foreground">{selectedCustomer.address}</div>
              <div className="text-sm font-semibold mt-2" data-testid="text-customer-due">Previous Due: Rs. {(selectedCustomer.currentDue || 0).toFixed(2)}</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => onSelectCustomer(null as any)} data-testid="button-change-customer">
              Change
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import CustomerSelector from '../CustomerSelector';

export default function CustomerSelectorExample() {
  const [customers] = useState([
    { id: '1', name: 'John Smith', phone: '555-0101', address: '123 Main St', currentDue: 450.00 },
    { id: '2', name: 'Sarah Johnson', phone: '555-0102', address: '456 Oak Ave', currentDue: 0 },
    { id: '3', name: 'Mike Wilson', phone: '555-0103', address: '789 Pine Rd', currentDue: 1200.50 },
  ]);
  const [selected, setSelected] = useState(null);

  return (
    <CustomerSelector
      customers={customers}
      selectedCustomer={selected}
      onSelectCustomer={setSelected}
      onCreateCustomer={(c) => console.log('Create customer:', c)}
    />
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Save } from 'lucide-react';

interface InvoiceHeaderProps {
  invoiceNumber: string;
  date: string;
  companyInfo: {
    name: string;
    address: string;
    contact: string;
  };
  onCompanyInfoUpdate?: (info: { name: string; address: string; contact: string }) => void;
}

export default function InvoiceHeader({ invoiceNumber, date, companyInfo, onCompanyInfoUpdate }: InvoiceHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(companyInfo);

  const handleSave = () => {
    onCompanyInfoUpdate?.(editData);
    setIsEditing(false);
  };

  return (
    <div className="flex justify-between items-start mb-8 border-b pb-4 gap-6 flex-wrap">
      {!isEditing ? (
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-1">{companyInfo.name}</h1>
          <p className="text-sm text-muted-foreground">{companyInfo.address}</p>
          <p className="text-sm text-muted-foreground">{companyInfo.contact}</p>
          <Button
            size="sm"
            variant="ghost"
            className="mt-2 print:hidden"
            onClick={() => setIsEditing(true)}
            data-testid="button-edit-company"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Header
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-md p-4 bg-muted rounded-lg border print:hidden">
          <h2 className="text-lg font-bold mb-3">Edit Header Details</h2>
          <Input
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            placeholder="Shop Name"
            className="mb-2"
            data-testid="input-company-name"
          />
          <Input
            value={editData.address}
            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
            placeholder="Address"
            className="mb-2"
            data-testid="input-company-address"
          />
          <Input
            value={editData.contact}
            onChange={(e) => setEditData({ ...editData, contact: e.target.value })}
            placeholder="Contact/Email"
            className="mb-3"
            data-testid="input-company-contact"
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" data-testid="button-save-company">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={() => setIsEditing(false)} size="sm" variant="secondary" data-testid="button-cancel-edit">
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      <div className="text-right">
        <div className="text-sm text-muted-foreground font-semibold">INVOICE</div>
        <div className="text-2xl font-bold text-primary" data-testid="text-invoice-number">{invoiceNumber}</div>
        <div className="text-sm text-muted-foreground mt-1" data-testid="text-invoice-date">Date: {date}</div>
      </div>
    </div>
  );
}

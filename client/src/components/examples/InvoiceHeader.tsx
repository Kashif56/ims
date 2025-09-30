import InvoiceHeader from '../InvoiceHeader';

export default function InvoiceHeaderExample() {
  return (
    <InvoiceHeader
      invoiceNumber="INV-00001"
      date={new Date().toLocaleDateString()}
      companyInfo={{
        name: "Mobile Hub Electronics",
        address: "123 Commerce Street, Business District",
        contact: "Ph: (555) 123-4567 | Email: sales@mobilehub.com"
      }}
      onCompanyInfoUpdate={(info) => console.log('Company info updated:', info)}
    />
  );
}

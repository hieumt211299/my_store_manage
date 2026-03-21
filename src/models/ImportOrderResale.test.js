import {
  createImportOrderResaleFormFromImportOrder,
  calculateImportOrderResaleTotal,
} from './ImportOrderResale';
import { updateImportOrderResaleItemSubtotal } from './ImportOrderResaleItem';

describe('import order resale helpers', () => {
  const importOrder = {
    id: 9110326001,
    ancarat_invoice_number: 'ANC-001',
    ancarat_cashier_name: 'Thu Ngan A',
    import_items: [
      {
        id: 1,
        product_id: 10,
        quantity: 2,
        import_price: 1500000,
        products: {
          name: 'Nhan vang',
          sku: 'SKU-001',
          image_url: 'https://example.com/image.jpg',
        },
      },
    ],
  };

  test('creates import resale form with expected received date after 4 days', () => {
    const form = createImportOrderResaleFormFromImportOrder(importOrder, 'staff@example.com');
    const resaleDate = new Date(form.resaleDate);
    const expectedReceivedDate = new Date(form.expectedReceivedDate);
    const diffDays = Math.round((expectedReceivedDate - resaleDate) / (1000 * 60 * 60 * 24));

    expect(form.importOrderId).toBe(importOrder.id);
    expect(form.ancaratInvoiceNumber).toBe(importOrder.ancarat_invoice_number);
    expect(form.items).toHaveLength(1);
    expect(diffDays).toBe(4);
  });

  test('recalculates subtotal and total from import resale prices', () => {
    const form = createImportOrderResaleFormFromImportOrder(importOrder, 'staff@example.com');
    const updatedItem = updateImportOrderResaleItemSubtotal(form.items[0], 2000000);
    const total = calculateImportOrderResaleTotal([updatedItem]);

    expect(updatedItem.subtotal).toBe(4000000);
    expect(total).toBe(4000000);
  });
});

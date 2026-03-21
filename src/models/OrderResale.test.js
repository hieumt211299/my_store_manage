import {
  createOrderResaleFormFromOrder,
  calculateOrderResaleTotal,
} from './OrderResale';
import { updateOrderResaleItemSubtotal } from './OrderResaleItem';

describe('order resale helpers', () => {
  const order = {
    id: 123,
    customer_name: 'Nguyen Van A',
    customer_phone: '0909000999',
    customer_id_number: '123456789',
    order_items: [
      {
        id: 1,
        product_id: 10,
        quantity: 2,
        selling_price: 1500000,
        products: {
          name: 'Nhan vang',
          sku: 'SKU-001',
          image_url: 'https://example.com/image.jpg',
        },
      },
    ],
  };

  test('creates resale form from order with expected payment date after 4 days', () => {
    const form = createOrderResaleFormFromOrder(order, 'staff@example.com');
    const resaleDate = new Date(form.resaleDate);
    const expectedPaymentDate = new Date(form.expectedPaymentDate);
    const diffDays = Math.round((expectedPaymentDate - resaleDate) / (1000 * 60 * 60 * 24));

    expect(form.orderId).toBe(order.id);
    expect(form.customerName).toBe(order.customer_name);
    expect(form.items).toHaveLength(1);
    expect(form.items[0].quantity).toBe(2);
    expect(diffDays).toBe(4);
  });

  test('recalculates subtotal and total from resale prices', () => {
    const form = createOrderResaleFormFromOrder(order, 'staff@example.com');
    const updatedItem = updateOrderResaleItemSubtotal(form.items[0], 2000000);
    const total = calculateOrderResaleTotal([updatedItem]);

    expect(updatedItem.subtotal).toBe(4000000);
    expect(total).toBe(4000000);
  });
});

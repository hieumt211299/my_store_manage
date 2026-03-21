import { formatCurrency } from './models';

test('formats currency in VND', () => {
  expect(formatCurrency(1500000)).toContain('₫');
});

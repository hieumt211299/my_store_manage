export const formatCurrency = (amount: number | null | undefined): string => {
  if (!amount && amount !== 0) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

export const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

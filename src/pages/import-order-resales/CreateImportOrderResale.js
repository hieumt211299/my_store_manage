import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import {
  Tables,
  ImportOrderFields,
  ImportOrderSourceType,
  ImportOrderStatus,
  ImportOrderSelectWithItems,
  ImportOrderResaleFields,
  createImportOrderResaleFormFromImportOrder,
  calculateImportOrderResaleTotal,
  buildImportOrderResaleInsertPayload,
  buildImportOrderResaleItemsPayload,
  updateImportOrderResaleItemSubtotal,
  formatCurrency,
} from '../../models';

const isImportOrderEligibleForResale = (importOrder, resaleExists) => {
  if (!importOrder || resaleExists) return false;
  const today = new Date().toISOString().split('T')[0];

  return (
    importOrder[ImportOrderFields.SOURCE_TYPE] === ImportOrderSourceType.ANCARAT &&
    importOrder[ImportOrderFields.STATUS] === ImportOrderStatus.PENDING &&
    Boolean(importOrder[ImportOrderFields.EXPECTED_RETURN_DATE]) &&
    importOrder[ImportOrderFields.EXPECTED_RETURN_DATE] >= today
  );
};

function CreateImportOrderResale() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const importOrderId = searchParams.get('importOrderId');

  const [importOrder, setImportOrder] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchImportOrder = async () => {
      if (!importOrderId) {
        addNotification('Thiếu mã đơn nhập để tạo giao dịch bán lại', 'error');
        navigate('/import-order-resales');
        return;
      }

      try {
        setLoading(true);

        const { data: importData, error: importError } = await supabase
          .from(Tables.IMPORT_ORDERS)
          .select(ImportOrderSelectWithItems)
          .eq(ImportOrderFields.ID, importOrderId)
          .single();

        if (importError) throw importError;

        const { data: resaleData, error: resaleError } = await supabase
          .from(Tables.IMPORT_ORDER_RESALES)
          .select(`${ImportOrderResaleFields.ID}, ${ImportOrderResaleFields.IMPORT_ORDER_ID}`)
          .eq(ImportOrderResaleFields.IMPORT_ORDER_ID, importOrderId)
          .maybeSingle();

        if (resaleError) throw resaleError;

        setImportOrder(importData);

        if (!isImportOrderEligibleForResale(importData, resaleData)) {
          addNotification('Đơn nhập này không đủ điều kiện để bán lại cho Ancarat', 'warning');
          navigate(`/imports/${importOrderId}`);
          return;
        }

        setForm(createImportOrderResaleFormFromImportOrder(importData, user?.email || 'Admin'));
      } catch (error) {
        console.error('Error fetching import order for resale:', error);
        addNotification(`Lỗi tải dữ liệu đơn nhập: ${error.message}`, 'error');
        navigate('/import-order-resales');
      } finally {
        setLoading(false);
      }
    };

    fetchImportOrder();
  }, [addNotification, importOrderId, navigate, user?.email]);

  const totalAmount = useMemo(() => calculateImportOrderResaleTotal(form?.items || []), [form]);

  const updateItemPrice = (index, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = updateImportOrderResaleItemSubtotal(items[index], value);
      return { ...prev, items };
    });
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.items.some((item) => item.resalePrice < 0)) {
      addNotification('Giá bán lại không được âm', 'error');
      return;
    }

    let createdResaleId = null;

    try {
      setSubmitting(true);
      const payload = buildImportOrderResaleInsertPayload(form, totalAmount, user?.email || 'Admin');

      const { data: createdResale, error: resaleError } = await supabase
        .from(Tables.IMPORT_ORDER_RESALES)
        .insert([payload])
        .select()
        .single();

      if (resaleError) throw resaleError;
      createdResaleId = createdResale.id;

      const itemsPayload = buildImportOrderResaleItemsPayload(form.items, createdResale.id);
      const { error: itemsError } = await supabase
        .from(Tables.IMPORT_ORDER_RESALE_ITEMS)
        .insert(itemsPayload);

      if (itemsError) throw itemsError;

      const { error: updateError } = await supabase
        .from(Tables.IMPORT_ORDERS)
        .update({ [ImportOrderFields.STATUS]: ImportOrderStatus.RESOLD_TO_ANCARAT })
        .eq(ImportOrderFields.ID, importOrderId);

      if (updateError) throw updateError;

      addNotification('Tạo giao dịch bán lại cho Ancarat thành công', 'success');
      navigate(`/import-order-resales/${createdResale.id}`);
    } catch (error) {
      console.error('Error creating import order resale:', error);

      if (createdResaleId) {
        await supabase
          .from(Tables.IMPORT_ORDER_RESALES)
          .delete()
          .eq(ImportOrderResaleFields.ID, createdResaleId);
      }

      addNotification(`Lỗi tạo giao dịch bán lại: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !form) {
    return <Loading type="page" message="Đang chuẩn bị giao dịch bán lại Ancarat..." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title={`Bán lại đơn nhập #${importOrder.id} cho Ancarat`}
        subtitle="Giữ nguyên toàn bộ sản phẩm, chỉ điều chỉnh giá bán lại và theo dõi ngày nhận tiền."
        backTo={`/imports/${importOrder.id}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin giao dịch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bán lại</label>
              <input type="date" value={form.resaleDate} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày dự kiến nhận tiền</label>
              <input 
                type="date" 
                value={form.expectedReceivedDate} 
                onChange={(e) => handleChange('expectedReceivedDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số hóa đơn Ancarat</label>
              <input type="text" value={form.ancaratInvoiceNumber} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thu ngân Ancarat</label>
              <input type="text" value={form.ancaratCashierName} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Sản phẩm bán lại</h2>
              <p className="text-sm text-gray-500 mt-1">Toàn bộ mặt hàng của đơn nhập gốc được giữ nguyên, chỉ thay đổi giá bán lại.</p>
            </div>
            <Link to={`/imports/${importOrder.id}`} className="text-sm text-blue-600 hover:text-blue-800">
              Xem đơn nhập gốc
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Giá bán lại</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {form.items.map((item, index) => (
                  <tr key={item.importItemId}>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {item.productImageUrl && (
                          <img src={item.productImageUrl} alt={item.productName} className="w-12 h-12 object-cover rounded-lg mr-3" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{item.productName}</div>
                          <div className="text-sm text-gray-500">SKU: {item.productSku || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input type="number" value={item.quantity} disabled className="w-20 px-2 py-1 text-center border border-gray-300 rounded bg-gray-50" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.resalePrice}
                        onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                        className="w-36 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-900">Tổng cộng</td>
                  <td className="px-4 py-3 text-right font-bold text-lg text-gray-900">{formatCurrency(totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link to={`/imports/${importOrder.id}`} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Hủy
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Đang lưu...' : 'Tạo giao dịch bán lại'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateImportOrderResale;

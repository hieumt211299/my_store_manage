import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { supabase } from '../../lib/supabase';
import Loading from '../../components/Loading';
import PurchaseLedgerPrintTemplate from '../../components/print-templates/PurchaseLedgerPrintTemplate';
import {
  Tables,
  ImportOrderFields,
  ImportItemFields,
  ImportOrderSourceType,
  ImportOrderSelectWithItems,
  formatCurrency,
} from '../../models';

const getTodayString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60000);
  return localDate.toISOString().split('T')[0];
};

const normalizeText = (value) => value || 'N/A';

function PurchaseLedgerReport() {
  const today = useMemo(() => getTodayString(), []);
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [appliedDateFrom, setAppliedDateFrom] = useState(today);
  const [appliedDateTo, setAppliedDateTo] = useState(today);
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Bang-ke-thu-mua-${appliedDateFrom}${appliedDateTo && appliedDateTo !== appliedDateFrom ? `-den-${appliedDateTo}` : ''}`,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');

      let query = supabase
        .from(Tables.IMPORT_ORDERS)
        .select(ImportOrderSelectWithItems)
        .eq(ImportOrderFields.SOURCE_TYPE, ImportOrderSourceType.CUSTOMER)
        .order(ImportOrderFields.IMPORT_DATE, { ascending: true });

      if (appliedDateFrom) {
        query = query.gte(ImportOrderFields.IMPORT_DATE, appliedDateFrom);
      }

      if (appliedDateTo) {
        query = query.lte(ImportOrderFields.IMPORT_DATE, appliedDateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      setImports(data || []);
    } catch (error) {
      console.error('Error fetching purchase ledger data:', error);
      setMessage(`Lỗi tải dữ liệu bảng kê: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [appliedDateFrom, appliedDateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const rows = useMemo(() => (
    imports.flatMap((importOrder) =>
      (importOrder.import_items || []).map((item, index) => ({
        id: `${importOrder[ImportOrderFields.ID]}-${item[ImportItemFields.ID] || index}`,
        importDate: importOrder[ImportOrderFields.IMPORT_DATE],
        sellerName: normalizeText(importOrder[ImportOrderFields.SELLER_NAME]),
        sellerAddress: normalizeText(importOrder[ImportOrderFields.SELLER_ADDRESS]),
        sellerIdNumber: normalizeText(importOrder[ImportOrderFields.SELLER_ID_NUMBER]),
        sellerPhone: normalizeText(importOrder[ImportOrderFields.SELLER_PHONE]),
        productName: item.products?.name || 'Sản phẩm không xác định',
        quantity: item[ImportItemFields.QUANTITY] || 0,
        unitPrice: item[ImportItemFields.IMPORT_PRICE] || 0,
        totalPrice: (item[ImportItemFields.QUANTITY] || 0) * (item[ImportItemFields.IMPORT_PRICE] || 0),
        note: '',
      }))
    )
  ), [imports]);

  const totalAmount = useMemo(
    () => rows.reduce((sum, row) => sum + row.totalPrice, 0),
    [rows],
  );

  const invalidRange = dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo);

  const handleApplyFilters = () => {
    if (invalidRange) {
      setMessage('Khoảng ngày không hợp lệ: ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.');
      return;
    }

    setMessage('');
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading message="Đang tải bảng kê thu mua..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Purchase Ledger</p>
        <h2 className="text-3xl font-semibold mt-2">Bảng kê thu mua</h2>
        <p className="text-slate-300 mt-3 max-w-3xl">
          Tổng hợp các import order có nguồn nhập là khách bán theo khoảng ngày để in hoặc lưu PDF theo mẫu 02/TNDN.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:max-w-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleApplyFilters}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
            >
              Áp dụng bộ lọc
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={rows.length === 0 || invalidRange}
              className={`rounded-lg px-4 py-2 text-white transition-colors ${
                rows.length === 0 || invalidRange
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              In / Lưu PDF
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">Nguồn nhập: Khách bán</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Khoảng ngày: {appliedDateFrom}{appliedDateTo !== appliedDateFrom ? ` -> ${appliedDateTo}` : ''}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Số dòng bảng kê: {rows.length}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Tổng giá trị: {formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 ${
          message.includes('Lỗi') || invalidRange
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-blue-200 bg-blue-50 text-blue-700'
        }`}>
          {message}
        </div>
      )}

      {invalidRange ? (
        <div className="bg-white border border-dashed border-red-300 rounded-3xl p-10 text-center text-red-700">
          Khoảng ngày không hợp lệ. Vui lòng chọn lại ngày bắt đầu và ngày kết thúc.
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-10 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl text-slate-700">
            0
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mt-4">Không có dữ liệu bảng kê trong khoảng ngày đã chọn</h3>
          <p className="text-gray-600 mt-2">
            Hệ thống không tìm thấy import order nào có nguồn nhập là khách bán trong khoảng ngày này.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm overflow-x-auto">
          <PurchaseLedgerPrintTemplate
            rows={rows}
            totalAmount={totalAmount}
            dateFrom={appliedDateFrom}
            dateTo={appliedDateTo}
          />
        </div>
      )}

      <div style={{ display: 'none' }}>
        <PurchaseLedgerPrintTemplate
          ref={printRef}
          rows={rows}
          totalAmount={totalAmount}
          dateFrom={appliedDateFrom}
          dateTo={appliedDateTo}
        />
      </div>
    </div>
  );
}

export default PurchaseLedgerReport;

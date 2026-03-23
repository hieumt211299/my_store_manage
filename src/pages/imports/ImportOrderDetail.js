import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import ImportInfoCard from './components/ImportInfoCard';
import ImportSourceInfo from './components/ImportSourceInfo';
import ImportItemsDetail from './components/ImportItemsDetail';
import ImportPrintTemplate from './components/ImportPrintTemplate';
import ImportWarehouseReceiptTemplate from './components/ImportWarehouseReceiptTemplate';
import {
  Tables,
  ImportOrderFields,
  ImportOrderStatus,
  ImportOrderSourceType,
  ImportOrderResaleFields,
  ImportOrderSelectWithItems,
  getImportStatusDisplay,
  formatDate,
} from '../../models';

function ImportOrderDetail() {
  const { id } = useParams();
  const { addNotification } = useNotification();
  const [importOrder, setImportOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [importOrderResale, setImportOrderResale] = useState(null);
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const printMenuRef = useRef(null);
  const printImportRef = useRef(null);
  const printWarehouseRef = useRef(null);

  const handleImportPrint = useReactToPrint({
    contentRef: printImportRef,
    documentTitle: `Phieu-nhap-hang-${id}`,
  });

  const handleWarehousePrint = useReactToPrint({
    contentRef: printWarehouseRef,
    documentTitle: `Phieu-nhap-kho-${id}`,
  });

  useEffect(() => {
    const fetchImportDetail = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        setFetchError(null);

        const { data, error } = await supabase
          .from(Tables.IMPORT_ORDERS)
          .select(ImportOrderSelectWithItems)
          .eq(ImportOrderFields.ID, id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setNotFound(true);
            setFetchError(null);
            addNotification('Không tìm thấy đơn nhập', 'error');
          } else {
            throw error;
          }
        } else {
          setImportOrder(data);

          const { data: resaleData, error: resaleError } = await supabase
            .from(Tables.IMPORT_ORDER_RESALES)
            .select(`${ImportOrderResaleFields.ID}, ${ImportOrderResaleFields.STATUS}, ${ImportOrderResaleFields.EXPECTED_RECEIVED_DATE}`)
            .eq(ImportOrderResaleFields.IMPORT_ORDER_ID, id)
            .maybeSingle();

          if (resaleError) throw resaleError;
          setImportOrderResale(resaleData);
        }
      } catch (error) {
        console.error('Error fetching import detail:', error);
        setFetchError(error.message);
        setNotFound(false);
        addNotification(`Lỗi tải đơn nhập: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchImportDetail();
  }, [id, addNotification]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (printMenuRef.current && !printMenuRef.current.contains(event.target)) {
        setIsPrintMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const updateImportStatus = async (newStatus) => {
    try {
      setStatusLoading(true);
      const updateData = { [ImportOrderFields.STATUS]: newStatus };
      
      // Set actual return date when completing the import order
      if (newStatus === 'completed') {
        updateData[ImportOrderFields.ACTUAL_RETURN_DATE] = new Date().toISOString().split('T')[0];
      }

      const { data, error } = await supabase
        .from(Tables.IMPORT_ORDERS)
        .update(updateData)
        .eq(ImportOrderFields.ID, id)
        .select()
        .single();

      if (error) throw error;

      // Update local state with the returned data
      setImportOrder(prev => ({ 
        ...prev, 
        ...data
      }));
      
      addNotification(
        `Cập nhật trạng thái thành công: ${getImportStatusDisplay(newStatus)}`, 
        'success'
      );
    } catch (error) {
      console.error('Error updating import status:', error);
      addNotification(`Lỗi cập nhật trạng thái: ${error.message}`, 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const canCreateResale =
    importOrder?.[ImportOrderFields.SOURCE_TYPE] === ImportOrderSourceType.ANCARAT &&
    importOrder?.[ImportOrderFields.STATUS] === ImportOrderStatus.PENDING &&
    importOrder?.[ImportOrderFields.EXPECTED_RETURN_DATE] >= today &&
    !importOrderResale;

  const printOptions = [
    {
      key: 'import',
      label: 'In phiếu nhập hàng',
      onClick: handleImportPrint,
    },
    {
      key: 'warehouse',
      label: 'In phiếu nhập kho',
      onClick: handleWarehousePrint,
    },
  ];

  const handlePrintOptionClick = (printAction) => {
    setIsPrintMenuOpen(false);
    printAction();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <Loading message="Đang tải chi tiết đơn nhập..." />
        </div>
      </div>
    );
  }

  if (notFound || fetchError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center h-64">
          {fetchError ? (
            <>
              <div className="text-lg text-red-600 mb-2">Lỗi tải đơn nhập</div>
              <div className="text-sm text-gray-500 mb-4">{fetchError}</div>
            </>
          ) : notFound ? (
            <div className="text-lg text-red-600 mb-4">Không tìm thấy đơn nhập</div>
          ) : null}
          <Link
            to="/imports"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Quay lại danh sách đơn nhập
          </Link>
        </div>
      </div>
    );
  }

  if (!importOrder) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Không có dữ liệu đơn nhập</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title={`Chi tiết đơn nhập #${importOrder.id}`}
        backTo="/imports"
        actions={
          <>
            {canCreateResale && (
              <Link
                to={`/import-order-resales/create?importOrderId=${importOrder.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Bán lại cho Ancarat
              </Link>
            )}
            {importOrderResale && (
              <Link
                to={`/import-order-resales/${importOrderResale.id}`}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Xem giao dịch bán lại
              </Link>
            )}
            <div className="relative" ref={printMenuRef}>
              <button
                type="button"
                onClick={() => setIsPrintMenuOpen((prev) => !prev)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <span>🖨️</span>
                <span>In phiếu</span>
                <span className={`transition-transform ${isPrintMenuOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {isPrintMenuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  {printOptions.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handlePrintOptionClick(option.onClick)}
                      className="block w-full px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        }
      />

      <div className="space-y-6">
        {importOrderResale && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-semibold text-purple-900">Đơn nhập này đã được bán lại cho Ancarat</div>
                <div className="text-sm text-purple-700 mt-1">
                  Giao dịch #{importOrderResale.id} với ngày dự kiến nhận tiền {formatDate(importOrderResale.expected_received_date)}.
                </div>
              </div>
              <Link to={`/import-order-resales/${importOrderResale.id}`} className="text-sm font-medium text-purple-700 hover:text-purple-900">
                Mở chi tiết giao dịch
              </Link>
            </div>
          </div>
        )}
        <ImportInfoCard 
          importOrder={importOrder}
          statusLoading={statusLoading}
          onUpdateStatus={updateImportStatus}
        />
        <ImportSourceInfo importOrder={importOrder} />
        <ImportItemsDetail items={importOrder.import_items} />
      </div>

      {/* Hidden Print Template */}
      <div style={{ display: 'none' }}>
        <ImportPrintTemplate ref={printImportRef} importOrder={importOrder} />
        <ImportWarehouseReceiptTemplate ref={printWarehouseRef} importOrder={importOrder} />
      </div>
    </div>
  );
}

export default ImportOrderDetail;

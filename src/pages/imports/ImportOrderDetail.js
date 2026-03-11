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
import {
  Tables,
  ImportOrderFields,
  ImportOrderSelectWithItems,
  getImportStatusDisplay,
} from '../../models';

function ImportOrderDetail() {
  const { id } = useParams();
  const { addNotification } = useNotification();
  const [importOrder, setImportOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Phieu-nhap-hang-${id}`,
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
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            🖨️ In phiếu
          </button>
        }
      />

      <div className="space-y-6">
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
        <ImportPrintTemplate ref={printRef} importOrder={importOrder} />
      </div>
    </div>
  );
}

export default ImportOrderDetail;
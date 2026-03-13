import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
import Loading from '../components/Loading';
import PageHeader from '../components/PageHeader';
import {
  Tables,
  CustomerFields,
  formatDate,
} from '../models';

function CustomerDetail() {
  const { id } = useParams();
  const { addNotification } = useNotification();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    id_number: '',
    id_issued_date: '',
    address: '',
  });

  useEffect(() => {
    const fetchCustomerDetail = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        setFetchError(null);
        const { data, error } = await supabase
          .from(Tables.CUSTOMERS)
          .select('*')
          .eq(CustomerFields.ID, id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setNotFound(true);
            setFetchError(null);
            addNotification('Không tìm thấy khách hàng', 'error');
          } else {
            throw error;
          }
        } else {
          setCustomer(data);
          setFormData({
            name: data[CustomerFields.NAME] || '',
            phone: data[CustomerFields.PHONE] || '',
            id_number: data[CustomerFields.ID_NUMBER] || '',
            id_issued_date: data[CustomerFields.ID_ISSUED_DATE] || '',
            address: data[CustomerFields.ADDRESS] || '',
          });
        }
      } catch (error) {
        console.error('Error fetching customer detail:', error);
        setFetchError(error.message);
        setNotFound(false);
        addNotification(`Lỗi tải thông tin khách hàng: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCustomerDetail();
  }, [id, addNotification]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      addNotification('Vui lòng nhập đầy đủ tên và số điện thoại', 'error');
      return;
    }

    try {
      setSaving(true);
      const updateData = {
        [CustomerFields.NAME]: formData.name.trim(),
        [CustomerFields.PHONE]: formData.phone.trim(),
        [CustomerFields.ID_NUMBER]: formData.id_number.trim() || null,
        [CustomerFields.ID_ISSUED_DATE]: formData.id_issued_date || null,
        [CustomerFields.ADDRESS]: formData.address.trim() || '',
      };

      const { data, error } = await supabase
        .from(Tables.CUSTOMERS)
        .update(updateData)
        .eq(CustomerFields.ID, id)
        .select()
        .single();

      if (error) throw error;

      setCustomer(prev => ({ ...prev, ...data }));
      setIsEditing(false);
      addNotification('Cập nhật thông tin khách hàng thành công!', 'success');
    } catch (error) {
      console.error('Error updating customer:', error);
      addNotification(`Lỗi cập nhật: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (customer) {
      setFormData({
        name: customer[CustomerFields.NAME] || '',
        phone: customer[CustomerFields.PHONE] || '',
        id_number: customer[CustomerFields.ID_NUMBER] || '',
        id_issued_date: customer[CustomerFields.ID_ISSUED_DATE] || '',
        address: customer[CustomerFields.ADDRESS] || '',
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return <Loading type="page" message="Đang tải thông tin khách hàng..." />;
  }

  if (!customer) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center h-64">
          {fetchError ? (
            <>
              <div className="text-lg text-red-600 mb-2">Lỗi tải thông tin khách hàng</div>
              <div className="text-sm text-gray-500 mb-4">{fetchError}</div>
            </>
          ) : notFound ? (
            <div className="text-lg text-red-600 mb-4">Không tìm thấy khách hàng</div>
          ) : null}
          <Link
            to="/customers"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Quay lại danh sách khách hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title={`Khách hàng #${customer[CustomerFields.ID]}`}
        backTo="/customers"
        actions={
          !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              ✏️ Sửa
            </button>
          )
        }
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Chỉnh sửa thông tin khách hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên khách hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên khách hàng"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CCCD/CMND
                  </label>
                  <input
                    type="text"
                    name="id_number"
                    value={formData.id_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số CCCD/CMND"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày cấp CCCD
                  </label>
                  <input
                    type="date"
                    name="id_issued_date"
                    value={formData.id_issued_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập địa chỉ"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-2xl font-medium text-gray-700">
                    {customer[CustomerFields.NAME].charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{customer[CustomerFields.NAME]}</h2>
                  <p className="text-gray-500">ID: #{customer[CustomerFields.ID]}</p>
                </div>
              </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin chi tiết</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Số điện thoại</p>
                      <p className="text-base font-medium text-gray-900 font-mono">
                        {customer[CustomerFields.PHONE] || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">CCCD/CMND</p>
                      <p className="text-base font-medium text-gray-900 font-mono">
                        {customer[CustomerFields.ID_NUMBER] || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày cấp CCCD</p>
                      <p className="text-base font-medium text-gray-900">
                        {customer[CustomerFields.ID_ISSUED_DATE] 
                          ? formatDate(customer[CustomerFields.ID_ISSUED_DATE]) 
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Địa chỉ</p>
                      <p className="text-base font-medium text-gray-900">
                        {customer[CustomerFields.ADDRESS] || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày tạo</p>
                      <p className="text-base font-medium text-gray-900">
                        {customer[CustomerFields.CREATED_AT] 
                          ? formatDate(customer[CustomerFields.CREATED_AT]) 
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày cập nhật</p>
                      <p className="text-base font-medium text-gray-900">
                        {customer[CustomerFields.UPDATED_AT] 
                          ? formatDate(customer[CustomerFields.UPDATED_AT]) 
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Giá trung bình đơn hàng</p>
                      <p className="text-base font-medium text-gray-900">
                        {customer[CustomerFields.AVERAGE_PRICE] 
                          ? new Intl.NumberFormat('vi-VN').format(customer[CustomerFields.AVERAGE_PRICE]) + ' VNĐ' 
                          : '0 VNĐ'}
                      </p>
                    </div>
                  </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerDetail;
// Template for entity list page
// Replace ENTITY_NAME with actual entity name
// Replace entity_name with lowercase version

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts';
import { Loading, PageHeader, NotificationBanner } from '../../components';
import { Tables, ENTITY_NAMEFields, ENTITY_NAMESelectBasic } from '../../models';

function ENTITY_NAMEList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(Tables.ENTITY_TABLE_NAME)
        .select(ENTITY_NAMESelectBasic)
        .is(ENTITY_NAMEFields.DELETED_AT, null)
        .order(ENTITY_NAMEFields.CREATED_DATE, { ascending: false });
      
      if (error) throw error;
      setData(data || []);
    } catch (error) {
      const errorMsg = `Lỗi tải dữ liệu: ${error.message}`;
      setMessage(errorMsg);
      addNotification(errorMsg, 'error', 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    
    try {
      const { error } = await supabase
        .from(Tables.ENTITY_TABLE_NAME)
        .update({ deleted_at: new Date().toISOString() })
        .eq(ENTITY_NAMEFields.ID, id);
        
      if (error) throw error;
      
      addNotification('Xóa thành công!', 'success', 3000);
      fetchData(); // Refresh data
    } catch (error) {
      addNotification(`Lỗi xóa: ${error.message}`, 'error', 5000);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6">
      <PageHeader 
        title="Danh sách ENTITY_NAME"
        action={
          <Link 
            to="create" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Thêm mới
          </Link>
        }
      />
      
      {message && <NotificationBanner message={message} type="error" />}
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Chưa có dữ liệu nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  {/* Add more header columns */}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.created_date).toLocaleDateString('vi-VN')}
                    </td>
                    {/* Add more data columns */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link 
                        to={`${item.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Xem
                      </Link>
                      <Link 
                        to={`edit/${item.id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Sửa
                      </Link>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ENTITY_NAMEList;

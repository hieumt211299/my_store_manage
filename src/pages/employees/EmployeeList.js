import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import Pagination from '../../components/Pagination';
import { useNotification } from '../../contexts/NotificationContext';
import {
  Tables,
  EmployeeFields,
} from '../../models';

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [itemsPerPage] = useState(15);
  const [statusFilter] = useState('all');
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  // Fetch employees from database with pagination and search
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calculate offset for pagination
      const offset = (currentPage - 1) * itemsPerPage;
      
      let query = supabase
        .from(Tables.EMPLOYEES)
        .select('*', { count: 'exact' })
        .is(EmployeeFields.DELETED_AT, null)
        .order(EmployeeFields.CREATED_AT, { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      // Apply search filter if searchQuery is provided
      if (searchQuery && searchQuery.trim()) {
        const search = searchQuery.trim();
        query = query.or(`${EmployeeFields.FULL_NAME}.ilike.%${search}%,${EmployeeFields.EMAIL}.ilike.%${search}%,${EmployeeFields.PHONE}.ilike.%${search}%,${EmployeeFields.EMPLOYEE_CODE}.ilike.%${search}%`);
      }

      // Apply status filter
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq(EmployeeFields.STATUS, statusFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setEmployees(data || []);
      setTotalEmployees(count || 0);
    } catch (error) {
      console.error('Error fetching employees:', error);
      addNotification(`Lỗi tải danh sách nhân viên: ${error.message}`, 'error', 5000);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, itemsPerPage, statusFilter, addNotification]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };



  // Calculate total pages
  const totalPages = Math.ceil(totalEmployees / itemsPerPage);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Quản lý nhân viên"
        actions={
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {totalEmployees} nhân viên
            </span>
            <button
              onClick={() => navigate('/employees/create')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Thêm nhân viên
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 max-w-md">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm nhân viên
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, email, SĐT, mã NV..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Tìm kiếm
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Employee Table */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nhân viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Liên hệ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="px-6 py-8 text-center text-gray-500">
                        {searchQuery || statusFilter !== 'all' 
                          ? 'Không tìm thấy nhân viên nào phù hợp với bộ lọc.' 
                          : 'Chưa có nhân viên nào.'
                        }
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee) => (
                      <tr 
                        key={employee.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/employees/${employee.id}`)}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {employee.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Mã NV: {employee.employee_code}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{employee.email}</div>
                          <div className="text-sm text-gray-500">{employee.phone}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EmployeeList;
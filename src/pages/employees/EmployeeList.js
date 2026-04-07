import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [itemsPerPage] = useState(15);
  const [statusFilter] = useState(searchParams.get('status') || 'all');
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

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('search', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (statusFilter !== 'all') params.set('status', statusFilter);

    const newSearch = params.toString();
    const currentSearch = searchParams.toString();
    if (newSearch !== currentSearch) {
      setSearchParams(params, { replace: true });
    }
  }, [searchQuery, currentPage, statusFilter, searchParams, setSearchParams]);

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

  const handleLinkClick = (e, employeeId) => {
    if (e.metaKey || e.ctrlKey || e.button === 1) {
      return;
    }
    e.preventDefault();
    navigate(`/employees/${employeeId}`);
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
    <div className="mx-auto max-w-8xl px-0 sm:px-2 lg:px-4">
      <PageHeader
        title="Quản lý nhân viên"
        actions={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">
              {totalEmployees} nhân viên
            </span>
            <button
              onClick={() => navigate('/employees/create')}
              className="w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 sm:w-auto"
            >
              Thêm nhân viên
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-md sm:flex-1">
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
          
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="submit"
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              Tìm kiếm
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="rounded-md bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
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
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3 text-xs text-gray-500 sm:hidden">
              Vuốt ngang để xem đầy đủ thông tin bảng.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] divide-y divide-gray-200">
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
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link 
                            to={`/employees/${employee.id}`}
                            onClick={(e) => handleLinkClick(e, employee.id)}
                            className="block text-gray-900 hover:text-blue-600"
                          >
                            <div>
                              <div className="text-sm font-medium">
                                {employee.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Mã NV: {employee.employee_code}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <Link 
                            to={`/employees/${employee.id}`}
                            onClick={(e) => handleLinkClick(e, employee.id)}
                            className="block text-gray-900 hover:text-blue-600"
                          >
                            <div className="text-sm">{employee.email}</div>
                            <div className="text-sm text-gray-500">{employee.phone}</div>
                          </Link>
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

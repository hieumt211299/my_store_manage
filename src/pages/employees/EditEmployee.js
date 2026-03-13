import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import { useNotification } from '../../contexts/NotificationContext';
import {
  Tables,
  EmployeeFields,
  mapEmployeeRowToForm,
  buildEmployeeUpdatePayload,
} from '../../models';

function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [employee, setEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchEmployee();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from(Tables.EMPLOYEES)
        .select('*')
        .eq(EmployeeFields.ID, id)
        .is(EmployeeFields.DELETED_AT, null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          addNotification('Nhân viên không tồn tại', 'error', 5000);
          navigate('/employees');
          return;
        }
        throw error;
      }

      setEmployee(data);
      setEmployeeForm(mapEmployeeRowToForm(data));
    } catch (error) {
      console.error('Error fetching employee:', error);
      addNotification(`Lỗi tải thông tin nhân viên: ${error.message}`, 'error', 5000);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!employeeForm.employeeCode.trim()) {
      errors.employeeCode = 'Mã nhân viên không được trống';
    }

    if (!employeeForm.fullName.trim()) {
      errors.fullName = 'Họ tên không được trống';
    }

    if (!employeeForm.email.trim()) {
      errors.email = 'Email không được trống';
    } else if (!/^\S+@\S+\.\S+$/.test(employeeForm.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!employeeForm.phone.trim()) {
      errors.phone = 'Số điện thoại không được trống';
    } else if (!/^[0-9]{10,11}$/.test(employeeForm.phone.replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại phải có 10-11 chữ số';
    }

    if (!employeeForm.idNumber.trim()) {
      errors.idNumber = 'CMND/CCCD không được trống';
    }

    if (!employeeForm.address.trim()) {
      errors.address = 'Địa chỉ không được trống';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setEmployeeForm(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const checkUniqueConstraints = async () => {
    // Check if employee code already exists (excluding current employee)
    const { data: existingCode, error: codeError } = await supabase
      .from(Tables.EMPLOYEES)
      .select('id')
      .eq(EmployeeFields.EMPLOYEE_CODE, employeeForm.employeeCode)
      .neq(EmployeeFields.ID, id)
      .is(EmployeeFields.DELETED_AT, null)
      .maybeSingle();

    if (codeError) throw codeError;
    if (existingCode) {
      throw new Error(`Mã nhân viên ${employeeForm.employeeCode} đã tồn tại`);
    }

    // Check if email already exists (excluding current employee)
    const { data: existingEmail, error: emailError } = await supabase
      .from(Tables.EMPLOYEES)
      .select('id')
      .eq(EmployeeFields.EMAIL, employeeForm.email)
      .neq(EmployeeFields.ID, id)
      .is(EmployeeFields.DELETED_AT, null)
      .maybeSingle();

    if (emailError) throw emailError;
    if (existingEmail) {
      throw new Error(`Email ${employeeForm.email} đã được sử dụng`);
    }

    // Check if ID number already exists (excluding current employee)
    const { data: existingId, error: idError } = await supabase
      .from(Tables.EMPLOYEES)
      .select('id')
      .eq(EmployeeFields.ID_NUMBER, employeeForm.idNumber)
      .neq(EmployeeFields.ID, id)
      .is(EmployeeFields.DELETED_AT, null)
      .maybeSingle();

    if (idError) throw idError;
    if (existingId) {
      throw new Error(`CMND/CCCD ${employeeForm.idNumber} đã được sử dụng`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Check unique constraints
      await checkUniqueConstraints();

      // Update employee
      const employeePayload = buildEmployeeUpdatePayload(employeeForm);
      
      const { error } = await supabase
        .from(Tables.EMPLOYEES)
        .update(employeePayload)
        .eq(EmployeeFields.ID, id);

      if (error) throw error;

      addNotification(
        `Đã cập nhật thành công nhân viên ${employeeForm.fullName}`,
        'success',
        3000
      );

      navigate(`/employees/${id}`);
    } catch (error) {
      console.error('Error updating employee:', error);
      addNotification(`Lỗi cập nhật nhân viên: ${error.message}`, 'error', 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  if (!employee || !employeeForm) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy nhân viên</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title={`Chỉnh sửa nhân viên: ${employee.full_name}`}
        actions={
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/employees/${id}`)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Hủy
            </button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Thông tin cơ bản
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="employeeCode" className="block text-sm font-medium text-gray-700 mb-2">
                Mã nhân viên <span className="text-red-500">*</span>
              </label>
              <input
                id="employeeCode"
                type="text"
                value={employeeForm.employeeCode}
                onChange={(e) => handleInputChange('employeeCode', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.employeeCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Mã nhân viên"
              />
              {validationErrors.employeeCode && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.employeeCode}</p>
              )}
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={employeeForm.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Nhập họ và tên"
              />
              {validationErrors.fullName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={employeeForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="example@company.com"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={employeeForm.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0987654321"
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-2">
                CMND/CCCD <span className="text-red-500">*</span>
              </label>
              <input
                id="idNumber"
                type="text"
                value={employeeForm.idNumber}
                onChange={(e) => handleInputChange('idNumber', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.idNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Số CMND/CCCD"
              />
              {validationErrors.idNumber && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.idNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor="idIssuedDate" className="block text-sm font-medium text-gray-700 mb-2">
                Ngày cấp CMND/CCCD
              </label>
              <input
                id="idIssuedDate"
                type="date"
                value={employeeForm.idIssuedDate}
                onChange={(e) => handleInputChange('idIssuedDate', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                rows={3}
                value={employeeForm.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Nhập địa chỉ đầy đủ"
              />
              {validationErrors.address && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pb-8">
          <button
            type="button"
            onClick={() => navigate(`/employees/${id}`)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md text-sm font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
          >
            {saving ? (
              <>
                <Loading size="sm" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>Cập nhật nhân viên</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditEmployee;
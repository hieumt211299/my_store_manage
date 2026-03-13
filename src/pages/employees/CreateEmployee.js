import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import { useNotification } from '../../contexts/NotificationContext';
import {
  Tables,
  EmployeeFields,
  createDefaultEmployeeForm,
  buildEmployeeInsertPayload,
  generateEmployeeCode,
} from '../../models';

function CreateEmployee() {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [employeeForm, setEmployeeForm] = useState(createDefaultEmployeeForm());
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Generate employee code automatically when component mounts
  useEffect(() => {
    generateEmployeeCodeAsync();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generateEmployeeCodeAsync = async () => {
    try {
      // Get current date for employee code generation
      const currentDate = new Date().toISOString().split('T')[0];
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      
      // Count existing employees in the current month/year
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      
      const { count, error } = await supabase
        .from(Tables.EMPLOYEES)
        .select('*', { count: 'exact', head: true })
        .gte(EmployeeFields.CREATED_AT, startDate)
        .lt(EmployeeFields.CREATED_AT, new Date(year, month, 1).toISOString())
        .is(EmployeeFields.DELETED_AT, null);

      if (error) throw error;

      const employeeCode = generateEmployeeCode(currentDate, count || 0);
      setEmployeeForm(prev => ({ ...prev, employeeCode }));
    } catch (error) {
      console.error('Error generating employee code:', error);
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
    // Check if employee code already exists
    const { data: existingCode, error: codeError } = await supabase
      .from(Tables.EMPLOYEES)
      .select('id')
      .eq(EmployeeFields.EMPLOYEE_CODE, employeeForm.employeeCode)
      .is(EmployeeFields.DELETED_AT, null)
      .maybeSingle();

    if (codeError) throw codeError;
    if (existingCode) {
      throw new Error(`Mã nhân viên ${employeeForm.employeeCode} đã tồn tại`);
    }

    // Check if email already exists
    const { data: existingEmail, error: emailError } = await supabase
      .from(Tables.EMPLOYEES)
      .select('id')
      .eq(EmployeeFields.EMAIL, employeeForm.email)
      .is(EmployeeFields.DELETED_AT, null)
      .maybeSingle();

    if (emailError) throw emailError;
    if (existingEmail) {
      throw new Error(`Email ${employeeForm.email} đã được sử dụng`);
    }

    // Check if ID number already exists
    const { data: existingId, error: idError } = await supabase
      .from(Tables.EMPLOYEES)
      .select('id')
      .eq(EmployeeFields.ID_NUMBER, employeeForm.idNumber)
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

      // Create employee with basic info and default work info
      const currentDate = new Date().toISOString().split('T')[0];
      const completeEmployeeForm = {
        ...employeeForm,
        role: 'staff', // Default role
        status: 'active', // Default status  
        hireDate: currentDate, // Use current date as hire date
        salary: '', // No salary specified
        department: '', // No department specified
        emergencyContactName: '', // No emergency contact
        emergencyContactPhone: '' // No emergency contact phone
      };
      
      const employeePayload = buildEmployeeInsertPayload(completeEmployeeForm);
      
      const { data, error } = await supabase
        .from(Tables.EMPLOYEES)
        .insert([employeePayload])
        .select()
        .single();

      if (error) throw error;

      addNotification(
        `Đã tạo thành công nhân viên ${employeeForm.fullName}`,
        'success',
        3000
      );

      navigate(`/employees/${data.id}`);
    } catch (error) {
      console.error('Error creating employee:', error);
      addNotification(`Lỗi tạo nhân viên: ${error.message}`, 'error', 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Thêm nhân viên mới"
        actions={
          <button
            onClick={() => navigate('/employees')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Quay lại
          </button>
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
                placeholder="Mã nhân viên tự động"
                readOnly
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
            onClick={() => navigate('/employees')}
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
              <span>Tạo nhân viên</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEmployee;
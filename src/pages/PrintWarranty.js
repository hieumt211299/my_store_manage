import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PrintWarranty = React.forwardRef(({ warrantyData: propWarrantyData }, ref) => {
  const location = useLocation();
  const navigate = useNavigate();
  const warrantyData = propWarrantyData || (location.state && location.state.warrantyData);

  useEffect(() => {
    // Redirect if no warranty data
    if (!warrantyData) {
      navigate('/warranty/create');
    }
  }, [warrantyData, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/warranty/create');
  };

  const handleCreateNew = () => {
    navigate('/warranty/create');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };
    const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    // hh/mm + dd/mm/yyyy
    return new Date(dateStr).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!warrantyData) return null;

  return (
    <div>
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Xem trước phiếu đảm bảo</h1>
              <p className="text-sm text-gray-600">Mã: {warrantyData.warrantyId}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleBack}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Quay lại chỉnh sửa
              </button>
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>🖨️</span>
                In phiếu
              </button>
              <button
                onClick={handleCreateNew}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Tạo phiếu mới
              </button>
            </div>
          </div>
        </div>
      </div>

    <div ref={ref} className="print-warranty-container">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body * {
            visibility: hidden;
          }
          .print-warranty-container, .print-warranty-container * {
            visibility: visible;
          }
          .print-warranty-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }

        .print-warranty-container {
          font-family: 'Times New Roman', Times, serif;
          color: #000;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
          font-size: 14px;
          line-height: 1.5;
        }

        .print-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .print-header h1 {
          font-size: 24px;
          font-weight: bold;
          margin: 0 0 5px 0;
        }

        .print-header .address {
          font-size: 13px;
          font-weight: bold;
          margin: 2px 0;
        }

        .print-header .hotline {
          font-size: 13px;
          font-weight: bold;
          margin: 2px 0;
        }

        .print-title {
          text-align: center;
          font-size: 22px;
          font-weight: bold;
          margin: 25px 0 20px 0;
        }

        .print-info {
          margin-bottom: 15px;
        }

        .print-info-row {
          display: flex;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .print-info-row .label {
          min-width: 100px;
        }

        .print-info-row .value {
          flex: 1;
        }

        .print-info-cccd-row {
          display: flex;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .print-info-cccd-row .cccd-group {
          flex: 1;
        }

        .print-info-cccd-row .issued-group {
          flex: 1;
          text-align: left;
          padding-left: 40px;
        }

        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 5px;
          font-size: 13px;
        }

        .print-table th,
        .print-table td {
          border: 1px solid #000;
          padding: 6px 8px;
        }

        .print-table th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
          font-size: 12px;
        }

        .print-table td.center {
          text-align: center;
        }

        .print-table td.right {
          text-align: right;
        }

        .print-total-row {
          display: flex;
          font-weight: bold;
          font-size: 14px;
          border: 1px solid #000;
          border-top: none;
        }

        .print-total-row .total-label {
          padding: 6px 8px;
          flex: 1;
        }

        .print-total-row .total-value {
          padding: 6px 8px;
          text-align: right;
          min-width: 150px;
        }

        .print-footer-info {
          margin-top: 8px;
          font-size: 14px;
        }

        .print-footer-info .row {
          margin-bottom: 3px;
        }

        .print-footer-info .bold {
          font-weight: bold;
        }

        .print-payment-row {
          display: flex;
          gap: 40px;
        }

        .print-thank-you {
          text-align: center;
          margin-top: 25px;
          font-size: 14px;
        }

        .print-signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          text-align: center;
          font-size: 14px;
        }

        .print-signatures .sign-col {
          width: 45%;
        }

        .print-signatures .sign-col .date-line {
          text-align: right;
          margin-bottom: 5px;
        }

        .print-signatures .sign-col .title {
          font-weight: bold;
          margin-bottom: 3px;
        }

        .print-signatures .sign-col .subtitle {
          font-size: 13px;
          font-style: italic;
        }

        .print-signatures .sign-col .sign-space {
          height: 70px;
        }
      `}</style>

      {/* Header */}
      <div className="print-header">
        <h1>KIM PHƯỢNG MAI Silver &amp; Jewelry</h1>
        <div className="address">Trụ sở: 43/44/20 Đỗ Thừa Luông, Phường Phú Thọ Hòa, TP Hồ Chí Minh</div>
        <div className="address">ĐC bán hàng: 100e Gò Dầu, Phường Tân Sơn Nhì, TP Hồ Chí Minh, Việt Nam</div>
        <div className="hotline">Hotline: 08.665.888.15</div>
      </div>

      {/* Title */}
      <div className="print-title">PHIẾU ĐẢM BẢO</div>

      {/* Customer Info */}
      <div className="print-info">
        <div className="print-info-row">
          <span className="label">Ngày:  {formatDateTime(warrantyData.createDate)}</span>
        </div>
        <div className="print-info-row">
          <span className="label">Khách hàng:  {warrantyData.customer.name}</span>
        </div>
        <div className="print-info-row">
          <span className="label">SĐT:  {warrantyData.customer.phone}</span>
        </div>
        <div className="print-info-row">
          <div className="cccd-group">
            <span>CCCD: {warrantyData.customer.idNumber}</span>
          </div>
          <div className="issued-group">
            {warrantyData.customer.idIssuedDate && (
              <span>Ngày cấp: {formatDate(warrantyData.customer.idIssuedDate)}</span>
            )}
          </div>
        </div>
        <div className="print-info-row">
          <span className="label">Địa chỉ:  {warrantyData.customer.address}</span>
        </div>
      </div>

      {/* Products Table */}
      <table className="print-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>STT</th>
            <th>TÊN HÀNG HÓA</th>
            <th style={{ width: '50px' }}>ĐVT</th>
            <th style={{ width: '40px' }}>SL</th>
            <th style={{ width: '100px' }}>ĐƠN GIÁ</th>
            <th style={{ width: '120px' }}>THÀNH TIỀN</th>
          </tr>
        </thead>
        <tbody>
          {warrantyData.items && warrantyData.items.map((item, index) => (
            <tr key={index}>
              <td className="center">{index + 1}</td>
              <td>{item.productName || 'Sản phẩm không xác định'}</td>
              <td className="center">Cái</td>
              <td className="center">{item.quantity}</td>
              <td className="right">{formatCurrency(item.sellingPrice)}</td>
              <td className="right">{formatCurrency(item.quantity * item.sellingPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div className="print-total-row">
        <div className="total-label">TỔNG THANH TOÁN</div>
        <div className="total-value">{formatCurrency(warrantyData.items.reduce((total, item) => total + (item.subtotal || 0), 0))}</div>
      </div>

      {/* Footer Info */}
      <div className="print-footer-info">
        <div className="row">
          <span className="bold">Ngày tạo phiếu: </span>
          <span>{formatDate(warrantyData.createDate)}</span>
        </div>
        <div className="print-payment-row">
          <span>
            <span className="bold">Hình thức thanh toán: </span>
            <span>{warrantyData.paymentMethod === 'bank' ? 'Chuyển khoản' : 'Tiền mặt'}</span>
          </span>
        </div>
      </div>

      {/* Thank you */}
      <div className="print-thank-you">
        Cảm ơn quý khách đã tin tưởng và lựa chọn sản phẩm của cửa hàng!
      </div>

      {/* Signatures */}
      <div className="print-signatures">
        <div className="sign-col">
          <div>&nbsp;</div>
          <div className="title">Nhân viên bán hàng</div>
          <div className="subtitle">(Ký, họ tên)</div>
          <div className="sign-space"></div>
        </div>
        <div className="sign-col">
          <div className="title">Ngày {formatDate(warrantyData.createDate)}</div>
          <div className="title">Khách hàng</div>
          <div className="subtitle">(Ký, họ tên)</div>
          <div className="sign-space"></div>
        </div>
      </div>
    </div>
    </div>
  );
});

PrintWarranty.displayName = 'PrintWarranty';

export default PrintWarranty;
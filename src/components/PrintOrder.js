import React from 'react';

const PrintOrder = React.forwardRef(({ order }, ref) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  if (!order) return null;

  return (
    <div ref={ref} className="print-order-container">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body * {
            visibility: hidden;
          }
          .print-order-container, .print-order-container * {
            visibility: visible;
          }
          .print-order-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }

        .print-order-container {
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

        .print-terms {
          margin-top: 30px;
          font-size: 12px;
          line-height: 1.4;
        }

        .print-terms h3 {
          font-weight: bold;
          margin: 8px 0 4px 0;
          font-size: 12px;
        }

        .print-terms p {
          margin: 2px 0;
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
      <div className="print-title">PHIẾU ĐẶT HÀNG</div>

      {/* Customer Info */}
      <div className="print-info">
        <div className="print-info-row">
          <span className="label">Số phiếu:</span>
          <span className="value">{order.id}</span>
        </div>
        <div className="print-info-row">
          <span className="label">Ngày:</span>
          <span className="value">{formatDate(order.created_date)}</span>
        </div>
        <div className="print-info-row">
          <span className="label">Khách hàng:</span>
          <span className="value">{order.customer_name}</span>
        </div>
        <div className="print-info-row">
          <span className="label">SĐT:</span>
          <span className="value">{order.customer_phone}</span>
        </div>
        <div className="print-info-cccd-row">
          <div className="cccd-group">
            <span>CCCD: {order.customer_id_number}</span>
          </div>
          <div className="issued-group">
            {order.customer_id_issued_date && (
              <span>Ngày cấp: {formatDate(order.customer_id_issued_date)}</span>
            )}
          </div>
        </div>
        <div className="print-info-row">
          <span className="label">Địa chỉ:</span>
          <span className="value">{order.customer_address}</span>
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
          {order.order_items && order.order_items.map((item, index) => (
            <tr key={item.id || index}>
              <td className="center">{index + 1}</td>
              <td>{item.products?.name || 'Sản phẩm không xác định'}</td>
              <td className="center">Cái</td>
              <td className="center">{item.quantity}</td>
              <td className="right">{formatCurrency(item.selling_price)}</td>
              <td className="right">{formatCurrency(item.quantity * item.selling_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div className="print-total-row">
        <div className="total-label">TỔNG THANH TOÁN</div>
        <div className="total-value">{formatCurrency(order.total_amount)}</div>
      </div>

      {/* Footer Info */}
      <div className="print-footer-info">
        <div className="row">
          <span className="bold">Ngày nhận hàng: </span>
          <span>{formatDate(order.receive_date)}</span>
        </div>
        <div className="print-payment-row">
          <span>
            <span className="bold">Hình thức thanh toán: </span>
            <span>{order.payment_method === 'bank' ? 'CK' : 'Tiền mặt'}</span>
          </span>
          <span>Khách mua online</span>
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
          <div className="date-line">Ngày {formatDate(order.created_date)}</div>
          <div className="title">Khách hàng</div>
          <div className="subtitle">(Ký, họ tên)</div>
          <div className="sign-space"></div>
        </div>
      </div>

      {/* Terms */}
      <div className="print-terms">
        <h3>Cam kết chung</h3>
        <p>1. Công ty TNHH Kim Phượng Mai Silver & Jewelry chỉ nhận trả hàng vật chất cho khách hàng khi khách hàng xuất trình đủ CCCD/ VNeID có đủ thông tin đúng như trong hợp đồng này.</p>
        <p>2. Khách hàng đã thanh toán 100% số tiền, nếu khách hàng yêu cầu hủy trước lịch hẹn trả hàng, Công ty TNHH Kim Phượng Mai Silver & Jewelry sẽ hoàn lại giá trị tương ứng theo giá niêm yết mua vào tại thời điểm Hủy Phiếu</p>
        <h3>Hiệu lực &amp; thỏa thuận</h3>
        <p>1. Phiếu có giá trị kể từ ngày ký</p>
        <p>2. Phiếu hết hiệu lực ngay sau khi CtyTNHH Kim Phượng Mai Silver&Jewelry giao đủ bạc vật lý cho khách</p>
        <p>3. Phiếu lưu dưới dạng file ảnh có dấu đỏ công ty hoặc phiếu giấy, đều có giá trị như nhau</p>
      </div>
    </div>
  );
});

PrintOrder.displayName = 'PrintOrder';

export default PrintOrder;

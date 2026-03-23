import React from 'react';
import { OrderFields, formatCurrency, numberToVietnameseCurrencyWords } from '../../models';

const FIXED_ADDRESS = '100E Gò Dầu, Phường Tân Sơn Nhì, Thành phố Hồ Chí Minh';

const getDateParts = (dateValue) => {
  const date = dateValue ? new Date(dateValue) : new Date();

  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    year: String(date.getFullYear()),
  };
};

const PrintWarehouseIssue = React.forwardRef(({ order }, ref) => {
  if (!order) return null;

  const createdDate = order[OrderFields.CREATED_DATE] || order[OrderFields.CREATED_AT];
  const { day, month, year } = getDateParts(createdDate);
  const items = order.order_items || [];
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + ((item.quantity || 0) * (item.selling_price || 0)),
    0
  );
  const totalAmountInWords = numberToVietnameseCurrencyWords(totalAmount);
  const customerAddress = order[OrderFields.CUSTOMER_ADDRESS] || '';

  return (
    <div ref={ref} className="print-warehouse-issue-container">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }
          body * {
            visibility: hidden;
          }
          .print-warehouse-issue-container,
          .print-warehouse-issue-container * {
            visibility: visible;
          }
          .print-warehouse-issue-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }

        .print-warehouse-issue-container {
          font-family: 'Times New Roman', Times, serif;
          color: #000;
          padding: 12px 18px;
          max-width: 800px;
          margin: 0 auto;
          font-size: 13px;
          line-height: 1.35;
        }

        .warehouse-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 12px;
        }

        .warehouse-company {
          width: 56%;
        }

        .warehouse-company-name {
          font-size: 15px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .warehouse-company-address {
          margin-bottom: 2px;
        }

        .warehouse-form-meta {
          width: 44%;
          font-size: 12px;
          text-align: left;
        }

        .warehouse-form-meta .meta-line {
          margin-bottom: 3px;
        }

        .warehouse-center {
          text-align: center;
          margin-bottom: 12px;
        }

        .warehouse-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .warehouse-date {
          font-style: italic;
        }

        .warehouse-accounts {
          width: 220px;
          margin-left: auto;
          margin-bottom: 8px;
        }

        .warehouse-accounts .line {
          display: flex;
          gap: 8px;
          margin-bottom: 3px;
        }

        .warehouse-accounts .label {
          min-width: 34px;
          font-weight: bold;
        }

        .warehouse-info {
          margin-bottom: 10px;
        }

        .warehouse-info-row {
          display: flex;
          margin-bottom: 4px;
        }

        .warehouse-info-row .label {
          min-width: 180px;
        }

        .warehouse-info-row .value {
          flex: 1;
        }

        .warehouse-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 12px;
        }

        .warehouse-table th,
        .warehouse-table td {
          border: 1px solid #000;
          padding: 5px 4px;
          vertical-align: middle;
        }

        .warehouse-table th {
          text-align: center;
          font-weight: bold;
        }

        .warehouse-table td.center {
          text-align: center;
        }

        .warehouse-table td.right {
          text-align: right;
        }

        .warehouse-summary {
          margin-top: 8px;
          font-size: 13px;
        }

        .warehouse-summary-row {
          display: flex;
          margin-bottom: 4px;
        }

        .warehouse-summary-row .label {
          min-width: 220px;
          font-weight: bold;
        }

        .warehouse-summary-row .value {
          flex: 1;
        }

        .warehouse-summary-row .value.dotted-line {
          display: block;
          white-space: nowrap;
          overflow: hidden;
        }

        .warehouse-sign-date {
          text-align: right;
          margin-top: 12px;
          margin-bottom: 6px;
          font-style: italic;
        }

        .warehouse-signatures {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          text-align: center;
          margin-top: 4px;
        }

        .warehouse-signatures .sign-col {
          flex: 1;
        }

        .warehouse-signatures .title {
          font-weight: bold;
          min-height: 34px;
        }

        .warehouse-signatures .subtitle {
          font-style: italic;
          font-size: 12px;
          min-height: 32px;
        }

        .warehouse-signatures .space {
          height: 66px;
        }
      `}</style>

      <div className="warehouse-top">
        <div className="warehouse-company">
          <div className="warehouse-company-name">CÔNG TY TNHH KIM PHƯỢNG MAI SILVER& JEWLRY</div>
          <div className="warehouse-company-address">43/44/20 Đỗ Thừa Luông, Phường Phú Thọ Hòa, TP Hồ Chí Minh</div>
        </div>

        <div className="warehouse-form-meta">
          <div className="meta-line"><strong>Mẫu số:</strong> 02 - VT</div>
          <div className="meta-line">(Ban hành theo Thông tư số 133/2016/TT-BTC</div>
          <div className="meta-line">Ngày 26/08/2016 của Bộ Tài chính)</div>
        </div>
      </div>

      <div className="warehouse-center">
        <div className="warehouse-title">PHIẾU XUẤT KHO</div>
        <div className="warehouse-date">Ngày {day} tháng {month} năm {year}</div>
      </div>

      <div className="warehouse-accounts">
        <div className="line">
          <span className="label">Nợ:</span>
          <span>....................................</span>
        </div>
        <div className="line">
          <span className="label">Có:</span>
          <span>....................................</span>
        </div>
        <div className="line">
          <span className="label">Số:</span>
          <span>{order[OrderFields.ID]}</span>
        </div>
      </div>

      <div className="warehouse-info">
        <div className="warehouse-info-row">
          <span className="label">- Họ tên người nhận hàng:</span>
          <span className="value">{order[OrderFields.CUSTOMER_NAME] || ''}</span>
        </div>
        <div className="warehouse-info-row">
          <span className="label">- Địa chỉ (bộ phận):</span>
          <span className="value">{customerAddress}</span>
        </div>
        <div className="warehouse-info-row">
          <span className="label">- Lý do xuất kho:</span>
          <span className="value">Xuất kho bán hàng</span>
        </div>
        <div className="warehouse-info-row">
          <span className="label">- Xuất tại kho (ngăn lô):</span>
          <span className="value">Cửa hàng</span>
        </div>
        <div className="warehouse-info-row">
          <span className="label">- Địa điểm:</span>
          <span className="value">{FIXED_ADDRESS}</span>
        </div>
      </div>

      <table className="warehouse-table">
        <thead>
          <tr>
            <th style={{ width: '38px' }}>STT</th>
            <th>Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ sản phẩm, hàng hóa</th>
            <th style={{ width: '82px' }}>Mã số</th>
            <th style={{ width: '56px' }}>Đơn vị tính</th>
            <th style={{ width: '56px' }}>Yêu cầu</th>
            <th style={{ width: '62px' }}>Thực xuất</th>
            <th style={{ width: '88px' }}>Đơn giá</th>
            <th style={{ width: '98px' }}>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? items.map((item, index) => (
            <tr key={item.id || index}>
              <td className="center">{index + 1}</td>
              <td>{item.products?.name || 'Sản phẩm không xác định'}</td>
              <td className="center">{item.products?.sku || ''}</td>
              <td className="center">Cái</td>
              <td className="center">{item.quantity ?? ''}</td>
              <td className="center">{item.quantity ?? ''}</td>
              <td className="right">{formatCurrency(item.selling_price)}</td>
              <td className="right">{formatCurrency((item.quantity || 0) * (item.selling_price || 0))}</td>
            </tr>
          )) : (
            <tr>
              <td className="center">1</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
          )}
          <tr>
            <td className="center">&nbsp;</td>
            <td className="center"><strong>Cộng</strong></td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td className="center"><strong>{items.length > 0 ? totalQuantity : ''}</strong></td>
            <td className="center"><strong>{items.length > 0 ? totalQuantity : ''}</strong></td>
            <td>&nbsp;</td>
            <td className="right"><strong>{items.length > 0 ? formatCurrency(totalAmount) : ''}</strong></td>
          </tr>
        </tbody>
      </table>

      <div className="warehouse-summary">
        <div className="warehouse-summary-row">
          <span className="label">- Tổng số tiền (Viết bằng chữ):</span>
          <span className="value">{totalAmountInWords || '\u00A0'}</span>
        </div>
        <div className="warehouse-summary-row">
          <span className="label">- Số chứng từ gốc kèm theo:</span>
          <span className="value dotted-line">
            ........................................................................................................
          </span>
        </div>
      </div>

      <div className="warehouse-sign-date">Ngày {day} tháng {month} năm {year}</div>

      <div className="warehouse-signatures">
        <div className="sign-col">
          <div className="title">Người lập phiếu</div>
          <div className="subtitle">(Ký, họ tên)</div>
          <div className="space" />
        </div>
        <div className="sign-col">
          <div className="title">Người nhận hàng</div>
          <div className="subtitle">(Ký, họ tên)</div>
          <div className="space" />
        </div>
        <div className="sign-col">
          <div className="title">Thủ kho</div>
          <div className="subtitle">(Ký, họ tên)</div>
          <div className="space" />
        </div>
        <div className="sign-col">
          <div className="title">Kế toán trưởng</div>
          <div className="subtitle">(Hoặc bộ phận có nhu cầu nhập)</div>
          <div className="space" />
        </div>
        <div className="sign-col">
          <div className="title">Giám đốc</div>
          <div className="subtitle">(Ký, họ tên, đóng dấu)</div>
          <div className="space" />
        </div>
      </div>
    </div>
  );
});

PrintWarehouseIssue.displayName = 'PrintWarehouseIssue';

export default PrintWarehouseIssue;

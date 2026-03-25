import React from 'react';
import { formatCurrency, numberToVietnameseCurrencyWords } from '../../models';

const COMPANY_NAME = 'CÔNG TY TNHH KIM PHƯỢNG MAI SILVER & JEWELRY';
const COMPANY_TAX_CODE = '046075000054';
const COMPANY_ADDRESS = '43/44/20 Đỗ Thừa Luông, P. Phú Thọ Hòa, TP. Hồ Chí Minh';
const COMPANY_PHONE = '0912452288';
const PURCHASE_LOCATION = '100e Gò Dầu, Phường Tân Sơn Nhì, TP Hồ Chí Minh, Việt Nam';

const formatDateValue = (dateValue) => {
  if (!dateValue) return '';

  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString('vi-VN');
};

const getReportDateLabel = (dateFrom, dateTo) => {
  if (dateFrom && dateTo && dateFrom === dateTo) {
    const date = new Date(`${dateFrom}T00:00:00`);
    return `Ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
  }

  if (dateFrom && dateTo) {
    return `Từ ngày ${formatDateValue(dateFrom)} đến ngày ${formatDateValue(dateTo)}`;
  }

  if (dateFrom) return `Từ ngày ${formatDateValue(dateFrom)}`;
  if (dateTo) return `Đến ngày ${formatDateValue(dateTo)}`;

  return '';
};

const PurchaseLedgerPrintTemplate = React.forwardRef(({ rows, totalAmount, dateFrom, dateTo }, ref) => {
  const reportDateLabel = getReportDateLabel(dateFrom, dateTo);
  const totalAmountInWords = numberToVietnameseCurrencyWords(totalAmount);

  return (
    <div ref={ref} className="purchase-ledger-print-container">
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 12mm;
          }
          body * {
            visibility: hidden;
          }
          .purchase-ledger-print-container,
          .purchase-ledger-print-container * {
            visibility: visible;
          }
          .purchase-ledger-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }

        .purchase-ledger-print-container {
          font-family: 'Times New Roman', Times, serif;
          color: #000;
          background: #fff;
          max-width: 1120px;
          margin: 0 auto;
          padding: 18px 20px;
          font-size: 13px;
          line-height: 1.35;
        }

        .purchase-ledger-meta {
          margin-bottom: 10px;
          font-size: 12px;
        }

        .purchase-ledger-title {
          text-align: center;
          font-weight: bold;
          font-size: 22px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .purchase-ledger-subtitle {
          text-align: center;
          font-style: italic;
          margin-bottom: 14px;
        }

        .purchase-ledger-company {
          margin-bottom: 10px;
        }

        .purchase-ledger-company-row {
          display: flex;
          gap: 8px;
          margin-bottom: 4px;
        }

        .purchase-ledger-company-row .label {
          min-width: 150px;
          font-weight: bold;
        }

        .purchase-ledger-company-row .value {
          flex: 1;
        }

        .purchase-ledger-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          margin-top: 10px;
          font-size: 12px;
        }

        .purchase-ledger-table th,
        .purchase-ledger-table td {
          border: 1px solid #000;
          padding: 5px 6px;
          vertical-align: top;
        }

        .purchase-ledger-table th {
          text-align: center;
          font-weight: bold;
        }

        .purchase-ledger-table th.group-header {
          font-size: 13px;
          padding-top: 8px;
          padding-bottom: 8px;
        }

        .purchase-ledger-table th.sub-header {
          font-weight: bold;
        }

        .purchase-ledger-table td.center {
          text-align: center;
        }

        .purchase-ledger-table td.right {
          text-align: right;
        }

        .purchase-ledger-total {
          margin-top: 10px;
        }

        .purchase-ledger-total-row {
          margin-bottom: 4px;
          font-weight: bold;
        }

        .purchase-ledger-signatures {
          display: flex;
          justify-content: space-between;
          gap: 48px;
          margin-top: 28px;
          text-align: center;
        }

        .purchase-ledger-signatures .sign-col {
          flex: 1;
        }

        .purchase-ledger-signatures .space {
          height: 80px;
        }
      `}</style>

      <div className="purchase-ledger-meta">
        Mẫu số: 02/TNDN (Ban hành kèm theo Thông tư số 20/2026/TT-BTC của Bộ trưởng Bộ Tài chính)
      </div>

      <div className="purchase-ledger-title">Bảng kê thu mua hàng hóa, dịch vụ không có hóa đơn</div>
      <div className="purchase-ledger-subtitle">
        {reportDateLabel ? `(${reportDateLabel})` : ''}
      </div>

      <div className="purchase-ledger-company">
        <div className="purchase-ledger-company-row">
          <span className="label">Tên doanh nghiệp:</span>
          <span className="value">{COMPANY_NAME}</span>
        </div>
        <div className="purchase-ledger-company-row">
          <span className="label">Mã số thuế:</span>
          <span className="value">{COMPANY_TAX_CODE}</span>
        </div>
        <div className="purchase-ledger-company-row">
          <span className="label">Địa chỉ:</span>
          <span className="value">{COMPANY_ADDRESS}</span>
        </div>
        <div className="purchase-ledger-company-row">
          <span className="label">Số điện thoại:</span>
          <span className="value">{COMPANY_PHONE}</span>
        </div>
        <div className="purchase-ledger-company-row">
          <span className="label">Địa chỉ nơi tổ chức thu mua:</span>
          <span className="value">{PURCHASE_LOCATION}</span>
        </div>
      </div>

      <table className="purchase-ledger-table">
        <thead>
          <tr>
            <th className="group-header" style={{ width: '92px' }}>
              Ngày<br />
              tháng<br />
              năm<br />
              mua<br />
              hàng
            </th>
            <th className="group-header" colSpan="4">Người bán</th>
            <th className="group-header" colSpan="4">Hàng hóa, dịch vụ mua vào</th>
            <th className="group-header" style={{ width: '90px' }} rowSpan="2">Ghi chú</th>
          </tr>
          <tr>
            <th className="sub-header" />
            <th className="sub-header" style={{ width: '120px' }}>
              Tên<br />
              người<br />
              bán
            </th>
            <th className="sub-header" style={{ width: '150px' }}>
              Địa<br />
              chỉ
            </th>
            <th className="sub-header" style={{ width: '108px' }}>
              Số<br />
              căn<br />
              cước
            </th>
            <th className="sub-header" style={{ width: '105px' }}>
              Số điện<br />
              thoại<br />
              (nếu<br />
              có)
            </th>
            <th className="sub-header">
              Tên<br />
              hàng<br />
              hóa,<br />
              dịch vụ
            </th>
            <th className="sub-header" style={{ width: '90px' }}>
              Số<br />
              lượng,<br />
              trọng<br />
              lượng
            </th>
            <th className="sub-header" style={{ width: '100px' }}>
              Đơn<br />
              giá
            </th>
            <th className="sub-header" style={{ width: '115px' }}>
              Tổng giá<br />
              thanh toán
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? rows.map((row) => (
            <tr key={row.id}>
              <td className="center">{formatDateValue(row.importDate)}</td>
              <td>{row.sellerName}</td>
              <td>{row.sellerAddress}</td>
              <td className="center">{row.sellerIdNumber}</td>
              <td className="center">{row.sellerPhone}</td>
              <td>{row.productName}</td>
              <td className="center">{row.quantity}</td>
              <td className="right">{formatCurrency(row.unitPrice)}</td>
              <td className="right">{formatCurrency(row.totalPrice)}</td>
              <td>{row.note}</td>
            </tr>
          )) : (
            <tr>
              <td colSpan="10" className="center">Không có dữ liệu trong khoảng ngày đã chọn</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="purchase-ledger-total">
        <div className="purchase-ledger-total-row">
          Tổng giá trị hàng hóa, dịch vụ mua vào: {formatCurrency(totalAmount)}
        </div>
        <div className="purchase-ledger-total-row">
          (Số tiền bằng chữ: {totalAmountInWords})
        </div>
      </div>

      <div className="purchase-ledger-signatures">
        <div className="sign-col">
          <div><strong>Người lập bảng kê</strong></div>
          <div>(Ký, ghi rõ họ tên)</div>
          <div className="space" />
        </div>
        <div className="sign-col">
          <div><strong>Ngày ..... tháng ..... năm .....</strong></div>
          <div><strong>Người đại diện hoặc người được ủy quyền của doanh nghiệp</strong></div>
          <div>(Ký tên, đóng dấu)</div>
          <div className="space" />
        </div>
      </div>
    </div>
  );
});

PurchaseLedgerPrintTemplate.displayName = 'PurchaseLedgerPrintTemplate';

export default PurchaseLedgerPrintTemplate;

import React from 'react';
import {
  OrderFields,
  PaymentMethod,
  OrderType,
  formatCurrency,
  formatDate,
  formatDateTime,
  numberToVietnameseCurrencyWords,
} from '../../models';
import {
  COMPANY_BANK_ACCOUNT_HOLDER,
  COMPANY_BANK_ACCOUNT_NUMBER,
  COMPANY_BANK_NAME,
  COMPANY_DISPLAY_NAME,
  COMPANY_HEAD_OFFICE_ADDRESS,
  COMPANY_HOTLINE,
  COMPANY_LEGAL_NAME,
  COMPANY_PHONE,
  COMPANY_REPRESENTATIVE_NAME,
  COMPANY_REPRESENTATIVE_TITLE,
  COMPANY_STORE_ADDRESS,
  COMPANY_TAX_CODE,
} from '../../config/companyInfo';

const extractMaterialPurity = (productName) => {
  if (!productName) return '';

  const normalizedName = String(productName).trim();
  const match = normalizedName.match(/(\d{3,4}\s?(?:k|K|K\b|%|‰)?|\d+\s?(?:L|l|ly|lượng))/);

  return match ? match[0].trim() : '';
};

const formatContractDate = (dateValue) => {
  const date = dateValue ? new Date(dateValue) : new Date();

  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
};

const renderWarrantyTemplate = (order) => (
  <>
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
        padding-left: 80px;
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

    <div className="print-header">
      <h1>{COMPANY_DISPLAY_NAME}</h1>
      <div className="address">Trụ sở: {COMPANY_HEAD_OFFICE_ADDRESS}</div>
      <div className="address">ĐC bán hàng: {COMPANY_STORE_ADDRESS}</div>
      <div className="hotline">Hotline: {COMPANY_HOTLINE}</div>
    </div>

    <div className="print-title">PHIẾU ĐẢM BẢO</div>

    <div className="print-info">
      <div className="print-info-row">
        <span>Số phiếu: {order[OrderFields.ID]}</span>
      </div>
      <div className="print-info-row">
        <span>Ngày: {formatDateTime(order[OrderFields.CREATED_AT])}</span>
      </div>
      <div className="print-info-row">
        <span>Nhân viên bán hàng: {order[OrderFields.CREATED_BY]}</span>
      </div>
      <div className="print-info-row">
        <span>Khách hàng: {order[OrderFields.CUSTOMER_NAME]}</span>
      </div>
      <div className="print-info-row">
        <span>SĐT: {order[OrderFields.CUSTOMER_PHONE]}</span>
      </div>
      <div className="print-info-cccd-row">
        <div className="cccd-group">
          <span>CCCD: {order[OrderFields.CUSTOMER_ID_NUMBER]}</span>
        </div>
        <div className="issued-group">
          {order[OrderFields.CUSTOMER_ID_ISSUED_DATE] && (
            <span>Ngày cấp: {formatDate(order[OrderFields.CUSTOMER_ID_ISSUED_DATE])}</span>
          )}
        </div>
      </div>
      <div className="print-info-row">
        <span>Địa chỉ: {order[OrderFields.CUSTOMER_ADDRESS]}</span>
      </div>
    </div>

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
        {order.order_items?.map((item, index) => (
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

    <div className="print-total-row">
      <div className="total-label">TỔNG THANH TOÁN</div>
      <div className="total-value">{formatCurrency(order[OrderFields.TOTAL_AMOUNT])}</div>
    </div>

    <div className="print-footer-info">
      <div className="row">
        <span className="bold">Ngày giao hàng dự kiến: </span>
        <span>{formatDate(order[OrderFields.EXPECTED_DELIVERY_DATE])}</span>
      </div>
      <div className="print-payment-row">
        <span>
          <span className="bold">Hình thức thanh toán: </span>
          <span>{order[OrderFields.PAYMENT_METHOD] === PaymentMethod.BANK ? 'Chuyển khoản' : 'Tiền mặt'}</span>
        </span>
      </div>
    </div>

    <div className="print-thank-you">
      Cảm ơn quý khách đã tin tưởng và lựa chọn sản phẩm của cửa hàng!
    </div>

    <div className="print-signatures">
      <div className="sign-col">
        <div>&nbsp;</div>
        <div className="title">Nhân viên bán hàng</div>
        <div className="subtitle">(Ký, họ tên)</div>
        <div className="sign-space"></div>
        {order[OrderFields.CREATED_BY] && (
          <div className="subtitle" style={{ fontStyle: 'normal', marginTop: '8px' }}>
            {order[OrderFields.CREATED_BY]}
          </div>
        )}
      </div>
      <div className="sign-col">
        <div className="title">Ngày {formatDate(order[OrderFields.CREATED_DATE])}</div>
        <div className="title">Khách hàng</div>
        <div className="subtitle">(Ký, họ tên)</div>
        <div className="sign-space"></div>
      </div>
    </div>
  </>
);

const renderSalesContractTemplate = (order) => {
  const items = order.order_items || [];
  const totalAmount = order[OrderFields.TOTAL_AMOUNT] || 0;
  const totalAmountInWords = numberToVietnameseCurrencyWords(totalAmount);
  const contractDate = formatContractDate(order[OrderFields.CREATED_AT] || order[OrderFields.CREATED_DATE]);
  const customerIssuedDate = order[OrderFields.CUSTOMER_ID_ISSUED_DATE]
    ? formatDate(order[OrderFields.CUSTOMER_ID_ISSUED_DATE])
    : null;

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm 12mm;
          }
          body * {
            visibility: hidden;
          }
          .print-order-container,
          .print-order-container * {
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
          padding: 8px 6px;
          max-width: 820px;
          margin: 0 auto;
          font-size: 14px;
          line-height: 1.45;
        }

        .contract-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 14px;
        }

        .contract-company {
          width: 48%;
          text-align: center;
        }

        .contract-company .name {
          font-weight: bold;
          text-transform: uppercase;
        }

        .contract-company .number {
          margin-top: 8px;
        }

        .contract-country {
          width: 48%;
          text-align: center;
        }

        .contract-country .name {
          font-weight: bold;
          text-transform: uppercase;
        }

        .contract-country .motto {
          font-weight: bold;
          margin-top: 2px;
        }

        .contract-country .line {
          margin-top: 4px;
        }

        .contract-title {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .contract-subtitle {
          text-align: center;
          margin-bottom: 14px;
        }

        .contract-paragraph {
          margin-bottom: 8px;
          text-align: justify;
        }

        .contract-party {
          margin-bottom: 10px;
        }

        .contract-party-row {
          display: flex;
          gap: 8px;
          margin-bottom: 4px;
        }

        .contract-party-row .label {
          min-width: 104px;
          font-weight: bold;
        }

        .contract-party-row .value {
          flex: 1;
        }

        .contract-party-inline {
          display: flex;
          gap: 24px;
        }

        .contract-section-title {
          font-weight: bold;
          margin: 10px 0 8px;
        }

        .contract-table {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0 10px;
          font-size: 13px;
        }

        .contract-table th,
        .contract-table td {
          border: 1px solid #000;
          padding: 6px 7px;
          vertical-align: top;
        }

        .contract-table th {
          text-align: center;
          font-weight: bold;
        }

        .contract-table td.center {
          text-align: center;
        }

        .contract-table td.right {
          text-align: right;
        }

        .contract-bullets {
          margin: 0 0 8px 16px;
          padding: 0;
        }

        .contract-bullets li {
          margin-bottom: 4px;
        }

        .contract-page-break {
          break-before: page;
          page-break-before: always;
          margin-top: 0;
          padding-top: 0;
        }

        .contract-signatures {
          display: flex;
          justify-content: space-between;
          gap: 48px;
          margin-top: 24px;
          text-align: center;
        }

        .contract-signatures .sign-col {
          flex: 1;
        }

        .contract-signatures .title {
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .contract-signatures .subtitle {
          font-style: italic;
        }

        .contract-signatures .space {
          height: 110px;
        }
      `}</style>

      <div className="contract-top">
        <div className="contract-company">
          <div className="name">{COMPANY_LEGAL_NAME}</div>
          <div className="number">Số: {order[OrderFields.ID]}</div>
        </div>
        <div className="contract-country">
          <div className="name">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div className="motto">Độc lập - Tự do - Hạnh phúc</div>
          <div className="line">----o0o----</div>
        </div>
      </div>

      <div className="contract-title">Hợp đồng mua bán</div>
      <div className="contract-subtitle">
        Hợp đồng này được lập ngày {contractDate.day} tháng {contractDate.month} năm {contractDate.year} được thực hiện bởi các bên tham gia dưới đây:
      </div>

      <div className="contract-party">
        <div className="contract-party-row">
          <span className="label">BÊN A:</span>
          <span className="value"><strong>{COMPANY_LEGAL_NAME}</strong></span>
        </div>
        <div className="contract-party-row">
          <span className="label">Địa chỉ:</span>
          <span className="value">{COMPANY_HEAD_OFFICE_ADDRESS}</span>
        </div>
        <div className="contract-party-row">
          <span className="label">Mã số thuế:</span>
          <span className="value">{COMPANY_TAX_CODE}</span>
        </div>
        <div className="contract-party-row">
          <span className="label">Điện thoại:</span>
          <span className="value">{COMPANY_PHONE}</span>
        </div>
        <div className="contract-party-row contract-party-inline">
          <span><strong>Đại diện:</strong> {COMPANY_REPRESENTATIVE_NAME}</span>
          <span><strong>Chức vụ:</strong> {COMPANY_REPRESENTATIVE_TITLE}</span>
        </div>
      </div>

      <div className="contract-party">
        <div className="contract-party-row">
          <span className="label">BÊN B:</span>
          <span className="value"><strong>{order[OrderFields.CUSTOMER_NAME] || 'N/A'}</strong></span>
        </div>
        <div className="contract-party-row">
          <span className="label">Địa chỉ:</span>
          <span className="value">{order[OrderFields.CUSTOMER_ADDRESS] || 'N/A'}</span>
        </div>
        <div className="contract-party-row">
          <span className="label">CCCD:</span>
          <span className="value">
            {order[OrderFields.CUSTOMER_ID_NUMBER] || 'N/A'}
            {customerIssuedDate ? ` - Ngày cấp: ${customerIssuedDate}` : ''}
          </span>
        </div>
        <div className="contract-party-row">
          <span className="label">Số điện thoại:</span>
          <span className="value">{order[OrderFields.CUSTOMER_PHONE] || 'N/A'}</span>
        </div>
      </div>

      <div className="contract-paragraph">
        Trên cơ sở sự đồng thuận của Bên A và Bên B trong việc thoả thuận xác lập về nghĩa vụ, quyền lợi của hai Bên, hai bên nhất trí thiết lập bản Hợp đồng này và cùng cam kết thực hiện nghiêm chỉnh nội dung của Hợp đồng với những điều khoản sau:
      </div>

      <div className="contract-section-title">Điều 1: Giá trị hợp đồng</div>
      <div className="contract-paragraph">
        Bên B đồng ý mua các sản phẩm của Bên A với thông tin chi tiết như sau:
      </div>

      <table className="contract-table">
        <thead>
          <tr>
            <th style={{ width: '42px' }}>STT</th>
            <th>Tên hàng</th>
            <th style={{ width: '110px' }}>HL vàng/bạc</th>
            <th style={{ width: '70px' }}>SL (cái)</th>
            <th style={{ width: '120px' }}>Đơn giá (VND)</th>
            <th style={{ width: '128px' }}>Thành tiền (VND)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id || index}>
              <td className="center">{index + 1}</td>
              <td>{item.products?.name || 'Sản phẩm không xác định'}</td>
              <td className="center">{extractMaterialPurity(item.products?.name)}</td>
              <td className="center">{item.quantity || 0}</td>
              <td className="right">{formatCurrency(item.selling_price)}</td>
              <td className="right">{formatCurrency((item.quantity || 0) * (item.selling_price || 0))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="contract-bullets">
        <li>Tổng giá trị hợp đồng: {formatCurrency(totalAmount)}</li>
        <li>(Bằng chữ: {totalAmountInWords})</li>
      </ul>

      <div className="contract-page-break">
        <div className="contract-section-title">Điều 2: Thời hạn giao hàng và phương thức thanh toán</div>
        <ul className="contract-bullets">
          <li>
            Phương thức thanh toán: {order[OrderFields.PAYMENT_METHOD] === PaymentMethod.BANK ? 'Chuyển khoản' : 'Tiền mặt'}.
            {order[OrderFields.PAYMENT_METHOD] === PaymentMethod.BANK && (
              <> Bên B thanh toán cho Bên A bằng hình thức chuyển khoản vào tài khoản sau: STK: {COMPANY_BANK_ACCOUNT_NUMBER} - {COMPANY_BANK_NAME}. Chủ tài khoản: {COMPANY_BANK_ACCOUNT_HOLDER}.</>
            )}
          </li>
        </ul>

        <div className="contract-paragraph"><strong>2. Phương thức mua hàng</strong></div>
        <div className="contract-paragraph">
          Bên B đặt cọc cho Bên A số tiền {formatCurrency(totalAmount)} ({totalAmountInWords}) để xác nhận đơn hàng mua.
        </div>

        <div className="contract-paragraph"><strong>3. Thời hạn giao hàng</strong></div>
        <div className="contract-paragraph">
          Bên A có trách nhiệm giao hàng cho Bên B trước ngày {formatDate(order[OrderFields.EXPECTED_DELIVERY_DATE])} theo đơn hàng đã được xác nhận sau khi Bên B hoàn tất thanh toán tiền đặt cọc.
        </div>

        <div className="contract-section-title">Điều 3: Điều khoản cam kết chung</div>
        <ul className="contract-bullets">
          <li>Bên A chỉ trả hàng cho bên B khi bên B xuất trình Hợp đồng mua bán và CCCD/hộ chiếu có thông tin đúng như trong hợp đồng này.</li>
          <li>Đến ngày hẹn trả hàng nhưng bên B không đến nhận và không thông báo cho bên A thì mặc định lịch hẹn trả hàng lùi thêm 30 ngày.</li>
          <li>Đối với hợp đồng không đặt cọc 100% và sau 10 ngày theo lịch hẹn trả hàng mà bên B vẫn không thanh toán đủ thì sẽ bị mất cọc và hợp đồng sẽ hết hiệu lực.</li>
          <li>Đối với hợp đồng thanh toán cọc 100%, bên B yêu cầu hủy hợp đồng trước lịch hẹn trả hàng, bên A sẽ hoàn lại giá trị tương ứng theo giá niêm yết mua vào tại thời điểm hủy hợp đồng.</li>
          <li>Bên A có trách nhiệm giao hàng đúng thời hạn cam kết. Trong trường hợp bên A trả hàng cho bên B chậm hơn 3 ngày kể từ ngày trả hàng, bên A sẽ bồi thường cho bên B 2% tổng giá trị hợp đồng và vẫn phải trả hàng.</li>
        </ul>

        <div className="contract-section-title">Điều 4: Hiệu lực thỏa thuận</div>
        <ul className="contract-bullets">
          <li>Hợp đồng có giá trị kể từ ngày ký.</li>
          <li>Hợp đồng sẽ hết hiệu lực ngay sau khi bên B giao đủ tiền và nhận đủ hàng hoặc khi hết hạn thanh toán theo điều 3.</li>
          <li>Hợp đồng này được lập thành 02 bản, có giá trị pháp lý như nhau.</li>
        </ul>

        <div className="contract-signatures">
          <div className="sign-col">
            <div className="title">Bên A</div>
            <div className="subtitle">(Ký và ghi rõ họ tên)</div>
            <div className="space" />
          </div>
          <div className="sign-col">
            <div className="title">Bên B</div>
            <div className="subtitle">(Ký và ghi rõ họ tên)</div>
            <div className="space" />
          </div>
        </div>
      </div>
    </>
  );
};

const PrintOrder = React.forwardRef(({ order }, ref) => {
  if (!order) return null;

  return (
    <div ref={ref} className="print-order-container">
      {order[OrderFields.ORDER_TYPE] === OrderType.WARRANTY
        ? renderWarrantyTemplate(order)
        : renderSalesContractTemplate(order)}
    </div>
  );
});

PrintOrder.displayName = 'PrintOrder';

export default PrintOrder;

import React from "react";
import {
  OrderFields,
  formatCurrency,
  formatDate,
  numberToVietnameseCurrencyWords,
  toTitleCase,
} from "../../models";
import {
  COMPANY_HEAD_OFFICE_ADDRESS,
  COMPANY_LEGAL_NAME,
  COMPANY_PHONE,
  COMPANY_REPRESENTATIVE_NAME,
  COMPANY_REPRESENTATIVE_TITLE,
  COMPANY_STORE_ADDRESS,
  COMPANY_TAX_CODE,
} from "../../config/companyInfo";
const extractMaterialPurity = (productName) => {
  if (!productName) return "";

  const normalizedName = String(productName).trim();
  const match = normalizedName.match(
    /(\d{3,4}\s?(?:k|K|K\b|%|‰)?|\d+\s?(?:L|l|ly|lượng))/,
  );

  return match ? match[0].trim() : "";
};

const formatContractDate = (dateValue) => {
  const date = dateValue ? new Date(dateValue) : new Date();

  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
};

const WarrantySalesContractTemplate = React.forwardRef(({ order }, ref) => {
  if (!order) return null;

  const items = order.order_items || [];
  const totalAmount = order[OrderFields.TOTAL_AMOUNT] || 0;
  const totalAmountInWords = numberToVietnameseCurrencyWords(totalAmount);
  const contractDate = formatContractDate(
    order[OrderFields.CREATED_AT] || order[OrderFields.CREATED_DATE],
  );
  const customerIssuedDate = order[OrderFields.CUSTOMER_ID_ISSUED_DATE]
    ? formatDate(order[OrderFields.CUSTOMER_ID_ISSUED_DATE])
    : null;
  const deliveryDate = order[OrderFields.EXPECTED_DELIVERY_DATE]
    ? formatDate(order[OrderFields.EXPECTED_DELIVERY_DATE])
    : formatDate(
        order[OrderFields.CREATED_DATE] || order[OrderFields.CREATED_AT],
      );

  return (
    <div ref={ref} className="print-warranty-contract-container">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm 12mm;
          }
          body * {
            visibility: hidden;
          }
          .print-warranty-contract-container,
          .print-warranty-contract-container * {
            visibility: visible;
          }
          .print-warranty-contract-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }

        .print-warranty-contract-container {
          font-family: 'Times New Roman', Times, serif;
          color: #000;
          padding: 8px 6px;
          max-width: 820px;
          margin: 0 auto;
          font-size: 14px;
          line-height: 1.45;
          background: #fff;
        }

        .contract-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 14px;
        }

        .contract-company,
        .contract-country {
          width: 48%;
          text-align: center;
        }

        .contract-company .name,
        .contract-country .name {
          font-weight: bold;
          text-transform: uppercase;
        }

        .contract-company .number {
          margin-top: 8px;
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
          flex-wrap: wrap;
        }

        .contract-section-title {
          font-weight: bold;
          margin: 10px 0 8px;
          text-transform: uppercase;
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
        .contract-signatures .name {
          margin-top: 8px;
        }      `}</style>

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
        Hợp đồng này được lập ngày {contractDate.day} tháng {contractDate.month}{" "}
        năm {contractDate.year} được thực hiện bởi các bên tham gia dưới đây:
      </div>

      <div className="contract-party">
        <div className="contract-party-row">
          <span className="label">BÊN A:</span>
          <span className="value">
            <strong>{toTitleCase(order[OrderFields.CUSTOMER_NAME]) || "N/A"}</strong>
          </span>
        </div>
        <div className="contract-party-row">
          <span className="label">Địa chỉ:</span>
          <span className="value">
            {order[OrderFields.CUSTOMER_ADDRESS] || "N/A"}
          </span>
        </div>
        <div className="contract-party-row">
          <span className="label">CCCD:</span>
          <span className="value">
            {order[OrderFields.CUSTOMER_ID_NUMBER] || "N/A"}
            {customerIssuedDate ? ` - Ngày cấp: ${customerIssuedDate}` : ""}
          </span>
        </div>
        <div className="contract-party-row">
          <span className="label">Số điện thoại:</span>
          <span className="value">
            {order[OrderFields.CUSTOMER_PHONE] || "N/A"}
          </span>
        </div>
      </div>

      <div className="contract-party">
        <div className="contract-party-row">
          <span className="label">BÊN B:</span>
          <span className="value">
            <strong>{COMPANY_LEGAL_NAME}</strong>
          </span>
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
          <span>
            <strong>Đại diện:</strong> {COMPANY_REPRESENTATIVE_NAME}
          </span>
          <span>
            <strong>Chức vụ:</strong> {COMPANY_REPRESENTATIVE_TITLE}
          </span>
        </div>
      </div>

      <div className="contract-paragraph">
        Trên cơ sở sự đồng thuận của Bên A và Bên B trong việc thoả thuận xác
        lập về nghĩa vụ, quyền lợi của hai Bên, hai bên nhất trí thiết lập bản
        Hợp đồng này và cùng cam kết thực hiện nghiêm chỉnh nội dung của Hợp
        đồng với những điều khoản sau:
      </div>

      <div className="contract-section-title">Điều 1: Giá trị hợp đồng</div>
      <div className="contract-paragraph">
        Bên A đồng ý mua các sản phẩm của Bên B với thông tin chi tiết như sau:
      </div>

      <table className="contract-table">
        <thead>
          <tr>
            <th style={{ width: "42px" }}>STT</th>
            <th>Tên hàng</th>
            <th style={{ width: "110px" }}>HL vàng/bạc</th>
            <th style={{ width: "70px" }}>SL (cái)</th>
            <th style={{ width: "120px" }}>Đơn giá (VND)</th>
            <th style={{ width: "128px" }}>Thành tiền (VND)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id || index}>
              <td className="center">{index + 1}</td>
              <td>{item.products?.name || "Sản phẩm không xác định"}</td>
              <td className="center">
                {extractMaterialPurity(item.products?.name)}
              </td>
              <td className="center">{item.quantity || 0}</td>
              <td className="right">{formatCurrency(item.selling_price)}</td>
              <td className="right">
                {formatCurrency(
                  (item.quantity || 0) * (item.selling_price || 0),
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="contract-bullets">
        <li>Tổng giá trị hợp đồng: {formatCurrency(totalAmount)}</li>
        <li>(Bằng chữ: {totalAmountInWords})</li>
      </ul>

      <div className="contract-page-break">
        <div className="contract-section-title">
          Điều 2: Giao hàng và phương thức thanh toán
        </div>
        <ul className="contract-bullets">
          <li>Thời gian giao hàng: {deliveryDate}</li>
          <li>Địa điểm giao hàng: {COMPANY_STORE_ADDRESS}</li>
          <li>
            Bên B có trách nhiệm giao hàng đúng số lượng, chất lượng và chủng
            loại như đã thỏa thuận.
          </li>
          <li>Bên B có trách nhiệm kiểm tra hàng hóa khi nhận.</li>
        </ul>

        <div className="contract-section-title">Điều 3: Cam kết chung</div>
        <ul className="contract-bullets">
          <li>
            Hai bên cam kết các thông tin cung cấp trong hợp đồng là đúng sự
            thật và chịu hoàn toàn trách nhiệm trước pháp luật về các thông tin
            này.
          </li>
          <li>
            Hai bên cam kết thực hiện đầy đủ các điều khoản đã thỏa thuận trong
            hợp đồng. Mọi sửa đổi, bổ sung (nếu có) phải được lập thành văn bản
            và có chữ ký xác nhận của cả hai bên.
          </li>
          <li>
            Trong quá trình thực hiện hợp đồng, nếu phát sinh vướng mắc, hai bên
            sẽ chủ động trao đổi trên tinh thần hợp tác, tôn trọng và cùng có
            lợi.
          </li>
          <li>
            Trường hợp một bên vi phạm nghĩa vụ gây thiệt hại cho bên còn lại
            thì phải chịu trách nhiệm bồi thường theo quy định của pháp luật.
          </li>
          <li>
            Hai bên đã đọc, hiểu rõ toàn bộ nội dung hợp đồng, đồng ý với tất cả
            các điều khoản và tự nguyện ký kết hợp đồng này.
          </li>
        </ul>

        <div className="contract-signatures">
          <div className="sign-col">
            <div className="title">Bên A</div>
            <div className="subtitle">(Ký và ghi rõ họ tên)</div>
            <div className="space" />
            <div className="name">{COMPANY_REPRESENTATIVE_NAME}</div>
          </div>
          <div className="sign-col">
            <div className="title">Bên B</div>
            <div className="subtitle">(Ký và ghi rõ họ tên)</div>
            <div className="space" />
            <div className="name">
              {toTitleCase(order[OrderFields.CUSTOMER_NAME]) || "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

WarrantySalesContractTemplate.displayName = "WarrantySalesContractTemplate";

export default WarrantySalesContractTemplate;

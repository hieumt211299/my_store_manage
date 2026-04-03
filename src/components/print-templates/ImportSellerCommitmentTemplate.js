import React from "react";
import { ImportItemFields, ImportOrderFields, formatDate, toTitleCase } from "../../models";
import { COMPANY_REPRESENTATIVE_NAME } from "../../config/companyInfo";
const ImportSellerCommitmentTemplate = React.forwardRef(
  ({ importOrder }, ref) => {
    if (!importOrder) return null;

    const items = importOrder.import_items || [];

    const sellerName = importOrder[ImportOrderFields.SELLER_NAME] || "N/A";
    const sellerAddress =
      importOrder[ImportOrderFields.SELLER_ADDRESS] || "N/A";
    const sellerIdNumber =
      importOrder[ImportOrderFields.SELLER_ID_NUMBER] || "N/A";
    const sellerPhone = importOrder[ImportOrderFields.SELLER_PHONE] || "N/A";
    const sellerIssuedDate = importOrder[
      ImportOrderFields.SELLER_ID_ISSUED_DATE
    ]
      ? formatDate(importOrder[ImportOrderFields.SELLER_ID_ISSUED_DATE])
      : null;

    return (
      <div ref={ref} className="print-seller-commitment-container">
        <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body * {
            visibility: hidden;
          }
          .print-seller-commitment-container,
          .print-seller-commitment-container * {
            visibility: visible;
          }
          .print-seller-commitment-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }

        .print-seller-commitment-container {
          background: #fff;
          color: #000;
          font-family: 'Times New Roman', Times, serif;
          max-width: 820px;
          margin: 0 auto;
          padding: 20px 24px;
          font-size: 14px;
          line-height: 1.55;
        }

        .seller-commitment-title {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .seller-commitment-meta {
          margin-bottom: 18px;
        }

        .seller-commitment-row {
          display: flex;
          gap: 8px;
          margin-bottom: 6px;
        }

        .seller-commitment-row .label {
          min-width: 120px;
          font-weight: bold;
        }

        .seller-commitment-row .value {
          flex: 1;
        }

        .seller-commitment-heading {
          text-align: center;
          font-weight: bold;
          margin: 18px 0 10px;
        }

        .seller-commitment-intro {
          margin-bottom: 10px;
        }

        .seller-commitment-section-title {
          margin-bottom: 8px;
        }

        .seller-commitment-items {
          margin-bottom: 8px;
          padding-left: 40px;
        }

        .seller-commitment-item {
          margin-bottom: 6px;
          page-break-inside: avoid;
        }

        .seller-commitment-item-title {
          font-weight: bold;
          margin-bottom: 4px;
        }

        .seller-commitment-item-row {
          display: flex;
          gap: 8px;
          margin-bottom: 2px;
        }

        .seller-commitment-shared-fields {
          margin-top: 2px;
          margin-bottom: 12px;
          page-break-inside: avoid;
        }

        .seller-commitment-item-row .label {
          min-width: 110px;
          font-weight: bold;
        }

        .seller-commitment-item-row .value {
          flex: 1;
        }

        .seller-commitment-item-row .blank-line {
          display: inline-block;
          width: 100%;
          border-bottom: 1px solid #000;
          transform: translateY(-3px);
        }

        .seller-commitment-list {
          margin: 0 0 16px 0;
          padding: 0;
        }

        .seller-commitment-paragraph {
          margin-bottom: 8px;
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .seller-commitment-paragraph .index {
          width: 28px;
          flex-shrink: 0;
        }

        .seller-commitment-paragraph .text {
          flex: 1;
        }

        .seller-commitment-company {
          margin-top: 16px;
          font-style: italic;
        }

        .seller-commitment-signatures {
          display: flex;
          justify-content: space-between;
          gap: 32px;
          text-align: center;
          margin-top: 22px;
        }

        .seller-commitment-signatures .sign-col {
          flex: 1;
        }

        .seller-commitment-signatures .title {
          font-weight: bold;
          text-transform: uppercase;
          min-height: 24px;
        }

        .seller-commitment-signatures .subtitle {
          font-style: italic;
          min-height: 12px;
        }

        .seller-commitment-signatures .space {
          height: 96px;
        }

        .seller-commitment-signatures .name {
          margin-top: 8px;
        }
      `}</style>

        <div className="seller-commitment-title">
          Biên bản cam kết bán tài sản
        </div>

        <div className="seller-commitment-meta">
          <div className="seller-commitment-row">
            <span className="label">Người bán:</span>
            <span className="value">{sellerName}</span>
          </div>
          <div className="seller-commitment-row">
            <span className="label">Địa chỉ:</span>
            <span className="value">{sellerAddress}</span>
          </div>
          <div className="seller-commitment-row">
            <span className="label">CCCD:</span>
            <span className="value">
              {sellerIdNumber}
              {sellerIssuedDate ? ` - Ngày cấp: ${sellerIssuedDate}` : ""}
            </span>
          </div>
          <div className="seller-commitment-row">
            <span className="label">Số điện thoại:</span>
            <span className="value">{sellerPhone}</span>
          </div>
        </div>

        <div className="seller-commitment-heading">NỘI DUNG CAM KẾT</div>
        <div className="seller-commitment-intro">
          Tôi xác nhận và cam kết như sau:
        </div>
        <div className="seller-commitment-section-title">
          1. Hàng hóa bán cho Bên mua có thông tin:
        </div>

        <div className="seller-commitment-items">
          {items.map((item, index) => (
            <div
              key={
                item[ImportItemFields.ID] ||
                `${item[ImportItemFields.PRODUCT_ID] || "item"}-${index}`
              }
              className="seller-commitment-item"
            >
              <div className="seller-commitment-item-row">
                <span className="label">- Tên hàng hóa:</span>
                <span className="value">{item.products?.name || "N/A"}</span>
              </div>
              <div className="seller-commitment-item-row">
                <span className="label">- Số lượng:</span>
                <span className="value">
                  {item[ImportItemFields.QUANTITY] || 0}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="seller-commitment-shared-fields">
          <div className="seller-commitment-item-row">
            <span className="label">- Mẫu mã:</span>
            <span className="value">
              <span className="blank-line">&nbsp;</span>
            </span>
          </div>
          <div className="seller-commitment-item-row">
            <span className="label">- Tình trạng:</span>
            <span className="value">mới</span>
          </div>
        </div>

        <div className="seller-commitment-list">
          <div className="seller-commitment-paragraph">
            <span className="index">2.</span>
            <span className="text">
              Tài sản nêu trên là tài sản thuộc quyền sở hữu hợp pháp của tôi,
              do tôi tự nguyện bán lại cho Bên mua.
            </span>
          </div>
          <div className="seller-commitment-paragraph">
            <span className="index">3.</span>
            <span className="text">
              Tài sản không phải tài sản trộm cắp, không có nguồn gốc bất hợp
              pháp, không thuộc diện tranh chấp, cầm cố, thế chấp, không bị ràng
              buộc bởi bất kỳ nghĩa vụ pháp lý nào.
            </span>
          </div>
          <div className="seller-commitment-paragraph">
            <span className="index">4.</span>
            <span className="text">
              Tôi chịu hoàn toàn trách nhiệm trước pháp luật nếu có bất kỳ khiếu
              nại, tranh chấp, hoặc xác minh từ cơ quan chức năng liên quan đến
              nguồn gốc tài sản.
            </span>
          </div>
          <div className="seller-commitment-paragraph">
            <span className="index">5.</span>
            <span className="text">
              Sau khi bàn giao tài sản và nhận đủ tiền, tôi không có bất kỳ
              khiếu nại, yêu cầu hay tranh chấp nào đối với Bên mua.
            </span>
          </div>
          <div className="seller-commitment-paragraph">
            <span className="index">6.</span>
            <span className="text">
              Bên mua không chịu trách nhiệm đối với các vấn đề phát sinh liên
              quan đến nguồn gốc tài sản trước thời điểm giao dịch.
            </span>
          </div>
        </div>

        <div className="seller-commitment-signatures">
          <div className="sign-col">
            <div className="title">Bên giao (Cá nhân)</div>
            <div className="subtitle">(Ký, ghi rõ họ tên)</div>
            <div className="space" />
            <div className="name">{toTitleCase(sellerName)}</div>
          </div>
          <div className="sign-col">
            <div className="title">Bên nhận (Doanh nghiệp)</div>
            <div className="subtitle">(Ký, ghi rõ họ tên, đóng dấu)</div>
            <div className="space" />
            <div className="name">{COMPANY_REPRESENTATIVE_NAME}</div>
          </div>
        </div>
      </div>
    );
  },
);

ImportSellerCommitmentTemplate.displayName = "ImportSellerCommitmentTemplate";

export default ImportSellerCommitmentTemplate;

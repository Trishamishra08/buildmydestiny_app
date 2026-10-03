/**
 * Build My Destiny – Professional Single-Page Tax Invoice & Delivery Challan Generator
 * Generates an isolated, pixel-perfect A4 printable GST Tax Invoice.
 */

// Number to Words converter for Indian Rupee currency
function amountInWords(num) {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Number(num) || 0);
  if (n === 0) return 'Zero Rupees Only';

  const inWords = (n) => {
    if (n < 20) return a[n];
    const digit = n % 10;
    if (n < 100) return b[Math.floor(n / 10)] + (digit ? '-' + a[digit] : ' ');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 === 0 ? '' : 'and ' + inWords(n % 100));
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
  };

  return inWords(n).trim() + ' Rupees Only';
}

export function printTaxInvoice(order, siteSettings = {}) {
  if (!order) return;

  const orderId = order.orderNumber || order.id || 'MST-894182';
  const orderDate = order.date || (order.createdAt ? order.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]);
  const orderTime = order.time || '10:30 AM';
  const customerName = order.customerName || order.siteAddress?.recipientName || 'Valued Customer';
  const customerPhone = order.customerPhone || order.siteAddress?.phone || '+91 98260 11223';
  const siteAddress = order.siteAddress || {};
  const fullAddress = [
    siteAddress.addressLine,
    siteAddress.landmark,
    siteAddress.city || 'Indore',
    siteAddress.state || 'Madhya Pradesh',
    siteAddress.pincode ? `PIN: ${siteAddress.pincode}` : '',
  ].filter(Boolean).join(', ') || 'Super Corridor Construction Site, Indore, MP - 452005';

  const paymentMethod = order.payment?.method || order.paymentMethod || 'Cash on Delivery (Pay on Site)';
  const paymentStatus = order.payment?.status || order.paymentStatus || 'Pending (Pay on Site)';
  const driverName = order.driverName || 'Ramesh Patel (Logistics Lead)';
  const vehicleNumber = order.vehicleNumber || 'MP-09-TR-4421';
  const grandTotal = Number(order.grandTotal || order.total || order.summary?.totalAmount || 0);

  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [];

  // Generate Table Rows
  const itemsRows = items.map((it, idx) => {
    const rawQty = it.quantity || 1;
    const qty = typeof rawQty === 'number' ? rawQty : parseInt(rawQty, 10) || 1;
    const rawUnit = it.product?.unit || it.unit || '';
    const unit = (!rawUnit || !isNaN(rawUnit) || rawUnit === '1' || rawUnit === 'Units') ? '' : rawUnit;
    const itemName = it.product?.name || it.name || 'Construction Material';
    const price = Number(it.price || it.product?.price || 0);
    const lineTotal = Number(it.lineTotal || (price * qty));
    const hsn = it.product?.hsn || it.hsn || '6810';

    return `
      <tr>
        <td style="padding: 7px 10px; border-bottom: 1px solid #E2E8F0; text-align: center; color: #64748B; font-size: 11px;">${idx + 1}</td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #E2E8F0; font-size: 11.5px; font-weight: 600; color: #0F172A;">
          ${itemName}
        </td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #E2E8F0; text-align: center; color: #64748B; font-size: 11px; font-family: monospace;">${hsn}</td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #E2E8F0; text-align: center; font-size: 11.5px; font-weight: 700; color: #0F172A;">
          ${qty}${unit ? ' ' + unit : ''}
        </td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #E2E8F0; text-align: right; font-size: 11px; color: #334155;">₹${price.toLocaleString('en-IN')}</td>
        <td style="padding: 7px 10px; border-bottom: 1px solid #E2E8F0; text-align: right; font-size: 11.5px; font-weight: 700; color: #08274C;">₹${lineTotal.toLocaleString('en-IN')}</td>
      </tr>
    `;
  }).join('');

  // Summary figures
  const subtotal = order.summary?.subtotal || items.reduce((acc, it) => acc + ((Number(it.price) || 0) * (Number(it.quantity) || 1)), 0) || grandTotal;
  const unloadingCharge = Number(order.summary?.unloadingCharge || 0);
  const deliveryCharge = Number(order.summary?.deliveryCharge || order.summary?.deliveryFee || 0);
  const discount = Number(order.summary?.bulkDiscount || order.summary?.discount || 0);
  const gstAmount = Number(order.summary?.gstAmount || 0);

  const invoiceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${orderId}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background-color: #FFFFFF;
      color: #0F172A;
      font-size: 11.5px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .invoice-wrapper {
      max-width: 800px;
      margin: 0 auto;
      border: 1.5px solid #08274C;
      padding: 16px 20px;
      background: #FFFFFF;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border-bottom: 2px solid #08274C;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .badge-invoice {
      display: inline-block;
      background-color: #08274C;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.1em;
      padding: 4px 10px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .meta-box {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      overflow: hidden;
    }
    .meta-box td {
      padding: 8px 12px;
      vertical-align: top;
      border-right: 1px solid #CBD5E1;
    }
    .meta-box td:last-child {
      border-right: none;
    }
    .label {
      font-size: 9.5px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }
    .value {
      font-size: 11.5px;
      font-weight: 700;
      color: #0F172A;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      border: 1px solid #CBD5E1;
    }
    .items-table th {
      background-color: #F1F5F9;
      color: #08274C;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 7px 10px;
      border-bottom: 1.5px solid #CBD5E1;
    }
    .totals-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    .totals-table td {
      padding: 4px 8px;
    }
    .amount-words-box {
      background-color: #F8FAFC;
      border: 1px dashed #CBD5E1;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 11px;
      margin-bottom: 12px;
    }
    .signatures-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
    }
    .sig-box {
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      height: 75px;
      padding: 6px 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .footer-note {
      font-size: 9px;
      color: #64748B;
      text-align: center;
      margin-top: 10px;
      border-top: 1px solid #E2E8F0;
      padding-top: 6px;
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <!-- Header with Logo and Company Info -->
    <table class="header-table">
      <tr>
        <td style="width: 55%; vertical-align: middle;">
          <!-- MASTER BRAND LOGO IMAGE -->
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <img src="/build-my-destiny-logo.png" alt="Build My Destiny - Construction Made Easy" style="width: 160px; height: 46px; object-fit: contain; display: block;" />
          </div>
          <div style="font-size: 10px; color: #475569; line-height: 1.35; margin-top: 4px;">
            <strong>BUILD MY DESTINY INFRA & CONSTRUCTION MATERIALS PVT. LTD.</strong><br/>
            Central Logistics Depot #14, Super Corridor Park, Indore, MP - 452005<br/>
            GSTIN: <strong>23AAECM5541Q1ZG</strong> | Support: ${siteSettings.supportPhone || '+91 98260 11223'}
          </div>
        </td>
        <td style="width: 45%; text-align: right; vertical-align: top;">
          <div class="badge-invoice">GST TAX INVOICE & CHALLAN</div>
          <div style="font-size: 14px; font-weight: 800; color: #08274C; margin-top: 6px;">
            ${orderId}
          </div>
          <div style="font-size: 10.5px; color: #475569; margin-top: 2px;">
            Invoice Date: <strong>${orderDate}</strong><br/>
            Time: <strong>${orderTime}</strong> | State: <strong>23 (MP)</strong>
          </div>
        </td>
      </tr>
    </table>

    <!-- Buyer & Dispatch Logistics Info Grid -->
    <table class="meta-box">
      <tr>
        <td style="width: 50%;">
          <div class="label">Billed To / Delivery Destination:</div>
          <div class="value" style="font-size: 12px;">${customerName}</div>
          <div style="font-size: 11px; color: #334155; margin-top: 2px;">Phone: <strong>${customerPhone}</strong></div>
          <div style="font-size: 10.5px; color: #475569; margin-top: 3px; line-height: 1.3;">
            ${fullAddress}
          </div>
        </td>
        <td style="width: 25%;">
          <div class="label">Payment Mode:</div>
          <div class="value">${paymentMethod}</div>
          <div style="font-size: 10.5px; color: ${paymentStatus.toLowerCase().includes('paid') ? '#059669' : '#D97706'}; font-weight: 700; margin-top: 2px;">
            Status: ${paymentStatus}
          </div>
        </td>
        <td style="width: 25%;">
          <div class="label">Logistics Dispatch:</div>
          <div class="value">${driverName}</div>
          <div style="font-size: 10.5px; color: #475569; margin-top: 2px;">
            Vehicle: <strong>${vehicleNumber}</strong><br/>
            Slot: <strong>Express Site Delivery</strong>
          </div>
        </td>
      </tr>
    </table>

    <!-- Material Line Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 6%; text-align: center;">#</th>
          <th style="width: 48%; text-align: left;">Material Description & Specifications</th>
          <th style="width: 12%; text-align: center;">HSN Code</th>
          <th style="width: 10%; text-align: center;">Qty</th>
          <th style="width: 12%; text-align: right;">Rate (₹)</th>
          <th style="width: 12%; text-align: right;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <!-- Amount Breakdown & Summary -->
    <table class="totals-table">
      <tr>
        <td style="width: 55%; vertical-align: top; padding-right: 15px;">
          <div class="amount-words-box">
            <span style="font-weight: 700; color: #475569; font-size: 9.5px; text-transform: uppercase;">Amount in Words:</span><br/>
            <strong style="color: #08274C; font-size: 11px;">${amountInWords(grandTotal)}</strong>
          </div>
          <div style="font-size: 9.5px; color: #64748B; line-height: 1.4;">
            • 100% Genuine MTC Certified Quality Material.<br/>
            • 100% Input Tax Credit (ITC) eligible under GST rules.
          </div>
        </td>
        <td style="width: 45%; vertical-align: top;">
          <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
            <tr>
              <td style="padding: 3px 0; color: #475569;">Materials Subtotal:</td>
              <td style="padding: 3px 0; text-align: right; font-weight: 600;">₹${subtotal.toLocaleString('en-IN')}</td>
            </tr>
            ${unloadingCharge > 0 ? `
            <tr>
              <td style="padding: 3px 0; color: #475569;">Site Unloading & Crane Handling:</td>
              <td style="padding: 3px 0; text-align: right; font-weight: 600;">₹${unloadingCharge.toLocaleString('en-IN')}</td>
            </tr>` : ''}
            ${deliveryCharge > 0 ? `
            <tr>
              <td style="padding: 3px 0; color: #475569;">Site Delivery & Freight:</td>
              <td style="padding: 3px 0; text-align: right; font-weight: 600;">₹${deliveryCharge.toLocaleString('en-IN')}</td>
            </tr>` : `
            <tr>
              <td style="padding: 3px 0; color: #475569;">Site Delivery & Freight:</td>
              <td style="padding: 3px 0; text-align: right; font-weight: 700; color: #059669;">FREE</td>
            </tr>`}
            ${discount > 0 ? `
            <tr>
              <td style="padding: 3px 0; color: #059669;">Bulk / Coupon Discount:</td>
              <td style="padding: 3px 0; text-align: right; font-weight: 700; color: #059669;">-₹${discount.toLocaleString('en-IN')}</td>
            </tr>` : ''}
            ${gstAmount > 0 ? `
            <tr>
              <td style="padding: 3px 0; color: #475569;">Estimated GST (18% ITC Included):</td>
              <td style="padding: 3px 0; text-align: right; font-weight: 600;">₹${gstAmount.toLocaleString('en-IN')}</td>
            </tr>` : ''}
            <tr style="border-top: 1.5px solid #08274C; border-bottom: 1.5px solid #08274C;">
              <td style="padding: 6px 0; font-size: 13px; font-weight: 800; color: #08274C;">Grand Total (INR):</td>
              <td style="padding: 6px 0; text-align: right; font-size: 15px; font-weight: 900; color: #08274C;">₹${grandTotal.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Signature Boxes -->
    <table class="signatures-table">
      <tr>
        <td style="width: 50%; padding-right: 10px;">
          <div class="sig-box">
            <div style="font-size: 9.5px; color: #64748B; font-weight: 700; text-transform: uppercase;">Customer / Site Receiver Acknowledgment</div>
            <div style="font-size: 10px; color: #94A3B8; border-top: 1px dashed #CBD5E1; padding-top: 4px;">
              Signature & Date (Received in Good Condition)
            </div>
          </div>
        </td>
        <td style="width: 50%; padding-left: 10px;">
          <div class="sig-box" style="text-align: right;">
            <div style="font-size: 9.5px; color: #64748B; font-weight: 700; text-transform: uppercase;">For Build My Destiny Infra & Materials Pvt. Ltd.</div>
            <div style="font-size: 10px; color: #08274C; font-weight: 700; border-top: 1px dashed #CBD5E1; padding-top: 4px;">
              Authorized Logistics Signatory
            </div>
          </div>
        </td>
      </tr>
    </table>

    <div class="footer-note">
      This is a digitally generated Tax Invoice & Delivery Challan issued by Build My Destiny Construction Materials System.
    </div>
  </div>
</body>
</html>
  `;

  // Print using hidden iframe to guarantee exact 1-page output without touching parent DOM
  let printFrame = document.getElementById('mistri-invoice-print-frame');
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.id = 'mistri-invoice-print-frame';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);
  }

  const frameDoc = printFrame.contentWindow || printFrame.contentDocument.document || printFrame.contentDocument;
  frameDoc.document.open();
  frameDoc.document.write(invoiceHtml);
  frameDoc.document.close();

  setTimeout(() => {
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
  }, 350);
}

export default printTaxInvoice;

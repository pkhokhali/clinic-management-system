const axios = require('axios');
const crypto = require('crypto');

// Khalti Payment Gateway
exports.initiateKhaltiPayment = async (amount, purchaseOrderId, purchaseOrderName) => {
  try {
    const payload = {
      return_url: `${process.env.FRONTEND_URL}/payment/callback/khalti`,
      website_url: process.env.FRONTEND_URL,
      amount: amount * 100, // Convert to paisa
      purchase_order_id: purchaseOrderId,
      purchase_order_name: purchaseOrderName,
    };

    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/initiate/',
      payload,
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Khalti payment error:', error.response?.data || error.message);
    throw error;
  }
};

exports.verifyKhaltiPayment = async (pidx) => {
  try {
    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Khalti verification error:', error.response?.data || error.message);
    throw error;
  }
};

// eSewa Payment Gateway
exports.generateEsewaSignature = (amount, transactionId, productId) => {
  const message = `total_amount=${amount},transaction_uuid=${transactionId},product_code=${productId}`;
  return crypto
    .createHash('sha256')
    .update(message)
    .digest('hex');
};

exports.initiateEsewaPayment = (amount, transactionId, productId, successUrl, failureUrl) => {
  const signature = this.generateEsewaSignature(amount, transactionId, productId);
  
  return {
    amount: amount,
    tax_amount: 0,
    total_amount: amount,
    transaction_uuid: transactionId,
    product_code: productId,
    product_service_charge: 0,
    product_delivery_charge: 0,
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: 'total_amount,transaction_uuid,product_code',
    signature: signature,
    merchant_id: process.env.ESEWA_MERCHANT_ID,
  };
};

exports.verifyEsewaPayment = (data) => {
  const {
    total_amount,
    transaction_uuid,
    product_code,
    signature,
  } = data;

  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  const generatedSignature = crypto
    .createHash('sha256')
    .update(message)
    .digest('hex');

  return generatedSignature === signature;
};

// Fonepay Payment Gateway
exports.initiateFonepayPayment = (amount, transactionId, productId, returnUrl) => {
  return {
    PRN: transactionId,
    PID: process.env.FONEPAY_MERCHANT_ID,
    MD: 'P',
    AMT: amount,
    CRN: 'NPR',
    DT: new Date().toISOString().split('T')[0],
    R1: 'Clinic Payment',
    R2: productId,
    RU: returnUrl,
  };
};

exports.generateFonepaySignature = (data) => {
  const message = `${data.PRN}${data.PID}${data.MD}${data.AMT}${data.CRN}${data.DT}${data.R1}${data.R2}`;
  return crypto
    .createHmac('sha512', process.env.FONEPAY_SECRET_KEY)
    .update(message)
    .digest('hex')
    .toUpperCase();
};

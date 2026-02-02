const crypto = require('crypto');

// Format amount the way PayHere expects (two decimal places as a string)
const formatAmount = (amount = 0) => Number(amount || 0).toFixed(2);

// Read PayHere config from env with sane defaults
const getPayHereConfig = () => {
  const mode = (process.env.PAYHERE_MODE || 'sandbox').toLowerCase();

  return {
    merchantId: process.env.PAYHERE_MERCHANT_ID,
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET,
    mode: mode === 'live' ? 'live' : 'sandbox'
  };
};

// PayHere MD5 signature generator (merchant_id + order_id + amount + currency + md5(merchant_secret))
const generateHash = ({ orderId, amount, currency, merchantId, merchantSecret }) => {
  const secret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  return crypto
    .createHash('md5')
    .update(`${merchantId}${orderId}${amount}${currency}${secret}`)
    .digest('hex')
    .toUpperCase();
};

// Verify md5sig received in PayHere IPN/notify callback
const verifyMd5Signature = (payload = {}) => {
  const { merchantSecret } = getPayHereConfig();
  if (!merchantSecret) return false;

  const expected = generateHash({
    merchantId: payload.merchant_id,
    orderId: payload.order_id,
    amount: formatAmount(payload.payhere_amount),
    currency: payload.payhere_currency,
    merchantSecret
  });

  return expected === (payload.md5sig || '').toUpperCase();
};

module.exports = {
  formatAmount,
  getPayHereConfig,
  generateHash,
  verifyMd5Signature
};

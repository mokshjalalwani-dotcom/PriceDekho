import QRCode from 'qrcode';

export const generateUpiUri = (upiId, merchantName, amount, reference, transactionNote = 'Satguru Electronics Order') => {
  if (!upiId || !amount) {
    throw new Error('UPI ID and Amount are required to generate a UPI link.');
  }

  const params = new URLSearchParams();
  params.append('pa', upiId);
  if (merchantName) params.append('pn', merchantName);
  params.append('am', amount.toString());
  params.append('cu', 'INR');
  
  if (transactionNote) params.append('tn', transactionNote);
  if (reference) {
    params.append('tr', reference);
  }

  // URLSearchParams encodes spaces as '+' and '@' as '%40'
  // Many UPI apps (like PhonePe) strictly expect '%20' for spaces and unencoded '@' in the pa parameter.
  const queryString = params.toString().replace(/\+/g, '%20').replace(/%40/g, '@');

  return `upi://pay?${queryString}`;
};

export const generateQrCode = async (upiUri) => {
  try {
    return await QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (err) {
    throw new Error(`Failed to generate QR Code: ${err.message}`);
  }
};

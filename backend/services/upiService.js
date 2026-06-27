import QRCode from 'qrcode';

export const generateUpiUri = (upiId, merchantName, amount, reference, transactionNote = 'Satguru Electronics Order') => {
  if (!upiId || !amount) {
    throw new Error('UPI ID and Amount are required to generate a UPI link.');
  }

  const uri = new URL('upi://pay');
  uri.searchParams.append('pa', upiId);
  if (merchantName) uri.searchParams.append('pn', merchantName);
  uri.searchParams.append('am', amount.toString());
  uri.searchParams.append('cu', 'INR');
  
  if (transactionNote) uri.searchParams.append('tn', transactionNote);
  if (reference) {
    uri.searchParams.append('tr', reference);
  }

  return uri.toString();
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

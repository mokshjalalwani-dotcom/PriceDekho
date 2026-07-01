import QRCode from 'qrcode';

/**
 * Build the UPI query string shared across all URI formats.
 * Returns a properly encoded query string with Indian UPI app compatibility fixes.
 */
const buildUpiQueryString = (upiId, merchantName, amount, transactionNote) => {
  const params = new URLSearchParams();
  params.append('pa', upiId);
  if (merchantName) params.append('pn', merchantName);
  params.append('am', amount.toString());
  params.append('cu', 'INR');
  params.append('tn', transactionNote);
  // mode=02 (Secure QR) and purpose=00 (Default) help some apps treat
  // the request like a scanned QR rather than a web-initiated intent.
  params.append('mode', '02');
  params.append('purpose', '00');

  // UPI apps expect '%20' for spaces and unencoded '@' in the pa parameter.
  return params.toString().replace(/\+/g, '%20').replace(/%40/g, '@');
};

/**
 * Generate UPI payment URIs for all platforms.
 *
 * - `upiUri`      → Standard upi://pay URI (used for QR codes and iOS)
 * - `intentUri`   → Android intent:// URI that opens the system UPI app chooser
 *                    even when Chrome blocks plain upi:// links from web pages.
 * - `gpayUri`     → Direct Google Pay link (tez:// scheme, works on Android & iOS)
 */
export const generateUpiLinks = (upiId, merchantName, amount, reference, transactionNote = 'Satguru Electronics Order') => {
  if (!upiId || !amount) {
    throw new Error('UPI ID and Amount are required to generate a UPI link.');
  }

  const qs = buildUpiQueryString(upiId, merchantName, amount, transactionNote);

  // 1. Standard UPI URI (works for QR code scanning & iOS Safari)
  const upiUri = `upi://pay?${qs}`;

  // 2. Android intent:// URI — Chrome blocks upi:// from <a> clicks but
  //    supports intent:// which opens the system app chooser for UPI apps.
  //    S.browser=true tells Chrome to fall back to the Play Store page if no UPI app is installed.
  const intentUri = `intent://pay?${qs}#Intent;scheme=upi;action=android.intent.action.VIEW;S.browser_fallback_url=https://play.google.com/store/search?q=upi%20payment;end`;

  // 3. Google Pay (tez://) deep link — works directly in GPay on both Android & iOS
  const gpayUri = `tez://upi/pay?${qs}`;

  return { upiUri, intentUri, gpayUri };
};

/** Backward-compatible wrapper — returns just the upi:// URI string */
export const generateUpiUri = (upiId, merchantName, amount, reference, transactionNote) => {
  return generateUpiLinks(upiId, merchantName, amount, reference, transactionNote).upiUri;
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


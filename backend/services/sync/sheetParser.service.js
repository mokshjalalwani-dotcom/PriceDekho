import { parse } from 'csv-parse/sync';

// Maps common column header variations to the canonical keys used by the sync engine.
// After the raw header is trimmed, lowercased, and whitespace-stripped, we check this map.
const COLUMN_ALIASES = {
  'productname': 'name',
  'sp': 'sellingprice',
};

export const parseSheet = async (sheetReference) => {
  try {
    let csvData = '';

    // If it's a URL, fetch it. (Can be a direct CSV export link)
    if (sheetReference.startsWith('http')) {
      // Auto-convert standard Google Sheets URL to CSV export if applicable
      let fetchUrl = sheetReference;
      if (fetchUrl.includes('docs.google.com/spreadsheets/d/')) {
        const match = fetchUrl.match(/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
          fetchUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
        }
      }

      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch sheet from URL: ${response.statusText}`);
      }
      csvData = await response.text();
    } else {
      // Could handle raw CSV string if uploaded or passed directly
      csvData = sheetReference;
    }

    if (!csvData || csvData.trim() === '') {
      throw new Error('Sheet data is empty');
    }

    // Parse CSV to JSON array
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // Normalize keys: trim, lowercase, strip whitespace, then apply aliases
    const normalizedRecords = records.map(record => {
      const normalizedRow = {};
      for (const [key, value] of Object.entries(record)) {
        let normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '');
        // Apply alias mapping for common header variations
        if (COLUMN_ALIASES[normalizedKey]) {
          normalizedKey = COLUMN_ALIASES[normalizedKey];
        }
        normalizedRow[normalizedKey] = value ? value.trim() : '';
      }
      return normalizedRow;
    });

    return normalizedRecords;
  } catch (error) {
    console.error('Sheet parsing error:', error);
    throw new Error(`Failed to parse sheet: ${error.message}`);
  }
};

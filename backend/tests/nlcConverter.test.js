import { convertToNLC, convertFromNLC } from '../utils/nlcConverter.js';

let failed = false;

const assertEqual = (actual, expected, testName) => {
  if (actual !== expected) {
    console.error(`❌ FAIL: ${testName}\n  Expected: ${expected}\n  Actual:   ${actual}`);
    failed = true;
  } else {
    console.log(`✅ PASS: ${testName}`);
  }
};

console.log("--- Testing convertToNLC ---");
assertEqual(convertToNLC('12345'), 'LRDHS', "Convert 12345 to LRDHS");
assertEqual(convertToNLC('9876543210'), 'QBTCSHDRLY', "Convert all digits");
assertEqual(convertToNLC('ABC123'), 'ABCLRD', "Mixed characters (ABC123)");
assertEqual(convertToNLC('12-34'), 'LR-DH', "Preserve hyphen (12-34)");
assertEqual(convertToNLC('1 2  3'), 'LRD', "Ignore spaces");
assertEqual(convertToNLC(null), '', "Handle null");
assertEqual(convertToNLC(undefined), '', "Handle undefined");

console.log("\n--- Testing convertFromNLC ---");
assertEqual(convertFromNLC('LRDHS'), '12345', "Convert LRDHS to 12345");
assertEqual(convertFromNLC('QBTCSHDRLY'), '9876543210', "Convert all letters");
assertEqual(convertFromNLC('LR-DH'), '12-34', "Preserve hyphen (LR-DH)");

if (failed) {
  process.exit(1);
} else {
  console.log("\nAll tests passed successfully!");
  process.exit(0);
}

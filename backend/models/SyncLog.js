import mongoose from 'mongoose';

const syncLogSchema = new mongoose.Schema({
  triggerSource: { type: String, required: true, enum: ['manual', 'scheduled'] },
  sheetReference: { type: String, required: true },
  totalRows: { type: Number, default: 0 },
  insertedCount: { type: Number, default: 0 },
  updatedCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  skippedCount: { type: Number, default: 0 },
  durationMs: { type: Number, default: 0 },
  duration: { type: String, default: '0s' },
  status: { type: String, enum: ['success', 'partial_success', 'failed'], default: 'success' },
  errors: [{
    row: { type: Number },
    sku: { type: String },
    reason: { type: String },
    details: { type: mongoose.Schema.Types.Mixed }
  }],
  snapshots: {
    inputRows: { type: mongoose.Schema.Types.Mixed }, // Array of valid rows
    previousStates: { type: mongoose.Schema.Types.Mixed } // Array of pre-sync product states
  }
}, { timestamps: true, suppressReservedKeysWarning: true });

// Indexes for faster log fetching
syncLogSchema.index({ createdAt: -1 });
syncLogSchema.index({ status: 1 });
syncLogSchema.index({ triggerSource: 1 });

const SyncLog = mongoose.model('SyncLog', syncLogSchema);
export default SyncLog;

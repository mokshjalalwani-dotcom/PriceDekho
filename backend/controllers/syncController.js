import { runGoogleSheetSync } from '../services/sync/googleSheetSyncService.js';
import { validateWebhookSecret, getSyncStatus } from '../services/sync/externalSyncTrigger.service.js';
import { replaySync, rollbackSync } from '../services/sync/syncReplay.service.js';
import { scanAndRepairSKUs } from '../services/sync/skuIntegrityValidator.service.js';
import SyncLog from '../models/SyncLog.js';
import Settings from '../models/Settings.js';

// @desc    Run Google Sheets Sync manually
// @route   POST /api/admin/sync/google-sheets/run
// @access  Private/Admin
export const runSync = async (req, res) => {
  try {
    let { sheetReference } = req.body;
    if (!sheetReference) {
      const settings = await Settings.findOne();
      sheetReference = settings?.googleSheetUrl;
    }
    if (!sheetReference) {
      return res.status(400).json({ message: 'Sheet reference is required. Please configure it in Settings.' });
    }

    const report = await runGoogleSheetSync({
      sheetReference,
      triggerSource: 'manual',
      dryRun: false
    });

    if (report.success) {
      res.status(200).json(report);
    } else {
      res.status(500).json({ message: 'Sync failed', report });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Dry Run Google Sheets Sync
// @route   POST /api/admin/sync/google-sheets/dry-run
// @access  Private/Admin
export const dryRunSync = async (req, res) => {
  try {
    let { sheetReference } = req.body;
    if (!sheetReference) {
      const settings = await Settings.findOne();
      sheetReference = settings?.googleSheetUrl;
    }
    if (!sheetReference) {
      return res.status(400).json({ message: 'Sheet reference is required. Please configure it in Settings.' });
    }

    const report = await runGoogleSheetSync({
      sheetReference,
      triggerSource: 'manual',
      dryRun: true
    });

    if (report.success) {
      res.status(200).json(report);
    } else {
      res.status(500).json({ message: 'Dry run failed', report });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get historical sync logs
// @route   GET /api/admin/sync/logs
// @access  Private/Admin
export const getSyncLogs = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const page = Number(req.query.page) || 1;

    const count = await SyncLog.countDocuments();
    const logs = await SyncLog.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1));

    res.json({ logs, page, pages: Math.ceil(count / limit), total: count });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    External trigger for Google Sheets Sync (Cron Jobs)
// @route   POST /api/admin/sync/google-sheets/external-run
// @access  Public (Protected by Webhook Secret)
export const externalRunSync = async (req, res) => {
  try {
    if (!validateWebhookSecret(req)) {
      return res.status(401).json({ message: 'Unauthorized: Invalid webhook secret' });
    }

    const sheetReference = process.env.SHEET_SYNC_URL;
    if (!sheetReference) {
      return res.status(400).json({ message: 'SHEET_SYNC_URL is not configured on the server' });
    }

    const report = await runGoogleSheetSync({
      sheetReference,
      triggerSource: 'scheduled',
      dryRun: false
    });

    if (report.success) {
      res.status(200).json({ message: 'External sync successful', report });
    } else {
      res.status(500).json({ message: 'External sync failed', report });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Replay a specific sync log
// @route   POST /api/admin/sync/replay/:id
// @access  Private/Admin
export const handleReplaySync = async (req, res) => {
  try {
    const result = await replaySync(req.params.id);
    res.status(200).json({ message: 'Sync replayed successfully', result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Rollback a specific sync log
// @route   POST /api/admin/sync/rollback/:id
// @access  Private/Admin
export const handleRollbackSync = async (req, res) => {
  try {
    const result = await rollbackSync(req.params.id);
    res.status(200).json({ message: 'Sync rolled back successfully', result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Check or repair SKU integrity
// @route   POST /api/admin/sync/sku-integrity
// @access  Private/Admin
export const handleSkuIntegrityCheck = async (req, res) => {
  try {
    const autoRepair = req.body.autoRepair === true;
    const report = await scanAndRepairSKUs({ autoRepair });
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get engine status
// @route   GET /api/admin/sync/status
// @access  Private/Admin
export const handleGetSyncStatus = (req, res) => {
  res.status(200).json(getSyncStatus());
};

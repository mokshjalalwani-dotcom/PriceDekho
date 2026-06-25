import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { RefreshCw, Database, AlertTriangle, CheckCircle, Clock, Settings } from 'lucide-react';

const GoogleSheetsSync = () => {
  const [sheetUrl, setSheetUrl] = useState(localStorage.getItem('syncSheetUrl') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDryRun, setIsDryRun] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [report, setReport] = useState(null);
  const [skuHealth, setSkuHealth] = useState(null);
  const [engineStatus, setEngineStatus] = useState(null);
  const { showToast } = useToast();

  const authHeader = {
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  };

  useEffect(() => {
    fetchLogs();
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      const [healthRes, statusRes] = await Promise.all([
        axios.post('/api/admin/sync/sku-integrity', {}, authHeader),
        axios.get('/api/admin/sync/status', authHeader)
      ]);
      setSkuHealth(healthRes.data);
      setEngineStatus(statusRes.data);
    } catch (error) {
      console.error('Failed to fetch health data', error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const { data } = await axios.get('/api/admin/sync/logs', authHeader);
      setLogs(data.logs);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch sync logs', 'error');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSync = async (dryRun = false) => {
    if (!sheetUrl.trim()) {
      showToast('Please enter a valid Google Sheets URL', 'error');
      return;
    }
    
    localStorage.setItem('syncSheetUrl', sheetUrl);
    
    setIsSyncing(true);
    setIsDryRun(dryRun);
    setReport(null);

    try {
      const endpoint = dryRun ? '/api/admin/sync/google-sheets/dry-run' : '/api/admin/sync/google-sheets/run';
      const { data } = await axios.post(endpoint, { sheetReference: sheetUrl }, authHeader);
      
      setReport(data);
      if (data.success) {
        showToast(dryRun ? 'Dry run completed successfully' : 'Sync completed successfully', 'success');
        if (!dryRun) fetchLogs();
      } else {
        showToast('Sync completed with errors', 'error');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Sync failed due to server error', 'error');
      setReport(error.response?.data?.report || { success: false, errors: [{ reason: error.message }] });
    } finally {
      setIsSyncing(false);
      fetchHealthData();
    }
  };

  const handleReplay = async (id) => {
    if (!window.confirm('Are you sure you want to replay this sync? This will re-run the exact data from the snapshot.')) return;
    try {
      const { data } = await axios.post(`/api/admin/sync/replay/${id}`, {}, authHeader);
      showToast('Sync replayed successfully', 'success');
      fetchLogs();
      fetchHealthData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Replay failed', 'error');
    }
  };

  const handleRollback = async (id) => {
    if (!window.confirm('Are you sure you want to rollback this sync? This will restore affected products to their previous state.')) return;
    try {
      const { data } = await axios.post(`/api/admin/sync/rollback/${id}`, {}, authHeader);
      showToast(`Rollback successful. Restored: ${data.result.restoredCount}, Deleted: ${data.result.deletedCount}`, 'success');
      fetchLogs();
      fetchHealthData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Rollback failed', 'error');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Google Sheets Auto-Sync</h1>
          <p className="text-gray-500">Import and update products directly from Google Sheets.</p>
        </div>
        {engineStatus && (
          <div className="bg-white px-4 py-2 rounded shadow-sm border border-gray-100 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${engineStatus.isRunning ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {engineStatus.isRunning ? 'Sync Running' : 'Engine Idle'}
            </span>
          </div>
        )}
      </div>

      {/* Health Panel */}
      {skuHealth && (
        <div className={`mb-8 p-6 rounded-lg border ${skuHealth.status === 'healthy' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className={skuHealth.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'} /> 
            SKU Integrity Health
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500">Total Products</div>
              <div className="text-xl font-bold">{skuHealth.totalProducts}</div>
            </div>
            <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500">Missing SKUs</div>
              <div className={`text-xl font-bold ${skuHealth.missingSkuCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {skuHealth.missingSkuCount}
              </div>
            </div>
            <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500">Duplicate SKUs</div>
              <div className={`text-xl font-bold ${skuHealth.duplicateSkuCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {skuHealth.duplicateSkuCount}
              </div>
            </div>
            <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500">Auto-Repaired</div>
              <div className="text-xl font-bold text-blue-600">{skuHealth.repairedCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Google Sheet URL</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="https://docs.google.com/spreadsheets/d/.../edit"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-2">
            Make sure your sheet is "Published to Web" as CSV, or the URL is publicly readable.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => handleSync(true)}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <AlertTriangle className="mr-2" />
            Dry Run (No Writes)
          </button>
          
          <button
            onClick={() => handleSync(false)}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={isSyncing && !isDryRun ? 'animate-spin mr-2' : 'mr-2'} />
            {isSyncing && !isDryRun ? 'Syncing...' : 'Run Sync Now'}
          </button>
        </div>
      </div>

      {/* Sync Report */}
      {report && (
        <div className={`mb-8 p-6 rounded-lg border ${report.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {report.success ? <CheckCircle className="text-green-600" /> : <AlertTriangle className="text-red-600" />}
            {report.dryRun ? 'Dry Run Report' : 'Sync Report'}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500">Total Rows</div>
              <div className="text-2xl font-bold">{report.totalRows}</div>
            </div>
            <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500">{report.dryRun ? 'Would Insert' : 'Inserted'}</div>
              <div className="text-2xl font-bold text-green-600">{report.insertedCount}</div>
            </div>
            <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500">{report.dryRun ? 'Would Affect' : 'Products Affected'}</div>
              <div className="text-2xl font-bold text-blue-600">{report.affectedCount ?? 0}</div>
            </div>
            <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500">Failed</div>
              <div className="text-2xl font-bold text-red-600">{report.failedCount}</div>
            </div>
          </div>

          {report.errors && report.errors.length > 0 && (
            <div className="bg-white p-4 rounded border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">Errors</h3>
              <ul className="text-sm space-y-1 text-red-600 max-h-48 overflow-y-auto">
                {report.errors.map((err, idx) => (
                  <li key={idx}>
                    Row {err.row}: {err.reason} (Model: {err.modelNumber})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Historical Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-semibold flex items-center gap-2 text-gray-700">
            <Database className="mr-2" /> Sync History
          </h2>
          <button onClick={fetchLogs} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
        
        {loadingLogs ? (
          <div className="p-8 text-center text-gray-500">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No sync history found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm">
                <th className="p-3 border-b border-gray-200 font-medium">Date</th>
                <th className="p-3 border-b border-gray-200 font-medium">Source</th>
                <th className="p-3 border-b border-gray-200 font-medium">Status</th>
                <th className="p-3 border-b border-gray-200 font-medium">Total</th>
                <th className="p-3 border-b border-gray-200 font-medium">Success</th>
                <th className="p-3 border-b border-gray-200 font-medium">Failed</th>
                <th className="p-3 border-b border-gray-200 font-medium">Duration</th>
                <th className="p-3 border-b border-gray-200 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-sm text-gray-700">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-3 text-sm">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs capitalize">
                      {log.triggerSource}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs capitalize ${
                      log.status === 'success' ? 'bg-green-100 text-green-700' :
                      log.status === 'partial_success' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {log.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-sm">{log.totalRows}</td>
                  <td className="p-3 text-sm text-green-600">{log.insertedCount + log.updatedCount}</td>
                  <td className="p-3 text-sm text-red-600">{log.failedCount}</td>
                  <td className="p-3 text-sm text-gray-500">{log.duration}</td>
                  <td className="p-3 text-sm text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleReplay(log._id)}
                        title="Replay Sync"
                        className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button 
                        onClick={() => handleRollback(log._id)}
                        title="Rollback Sync"
                        className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                      >
                        <Clock size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GoogleSheetsSync;

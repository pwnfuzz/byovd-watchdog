import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, RefreshCw, Download, Eye } from 'lucide-react';

const RESULTS_INDEX_URL = "https://raw.githubusercontent.com/pwnfuzz/byovd-watchdog/main/data/jsons/results_index.json";

const getLatestResultsUrl = (fileList) => {
  // Expect filenames like byovd_finder_results_YYYYMMDD_HHMMSS.json
  const sorted = [...fileList].sort((a, b) => {
    const getTs = (name) => {
      const match = name.match(/byovd_finder_results_(\d{8}_\d{6})\.json/);
      return match ? match[1] : "";
    };
    return getTs(b).localeCompare(getTs(a));
  });
  return sorted.length > 0
    ? `https://raw.githubusercontent.com/pwnfuzz/byovd-watchdog/main/data/jsons/${sorted[0]}`
    : null;
};

const extractDateFromFilename = (filename) => {
  // Expects byovd_finder_results_YYYYMMDD_HHMMSS.json
  const match = filename.match(/byovd_finder_results_(\d{8})_(\d{6})\.json/);
  if (!match) return null;
  const [_, yyyymmdd, hhmmss] = match;
  const year = yyyymmdd.slice(0, 4);
  const month = yyyymmdd.slice(4, 6);
  const day = yyyymmdd.slice(6, 8);
  return `${year}-${month}-${day}`;
};

const Dashboard = () => {
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestUrl, setLatestUrl] = useState(null);
  const [latestFilename, setLatestFilename] = useState(null);

  const fetchLatestData = async () => {
    try {
      setLoading(true);
      // Step 1: Fetch index
      const indexRes = await fetch(RESULTS_INDEX_URL);
      if (!indexRes.ok) throw new Error("Failed to fetch results index");
      const fileList = await indexRes.json();
      const url = getLatestResultsUrl(fileList);
      if (!url) throw new Error("No results files found");
      setLatestUrl(url);
      // Also store the filename for date display
      const urlParts = url.split("/");
      setLatestFilename(urlParts[urlParts.length - 1]);
      // Step 2: Fetch latest results
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch results");
      const data = await res.json();
      setLatestData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load latest data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestData();
    // eslint-disable-next-line
  }, []);

  const refreshData = () => {
    fetchLatestData();
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="loading-container">
        <div className="loading"></div>
        <p>SCANNING KERNEL DRIVERS...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-container">
        <h2>SYSTEM ERROR</h2>
        <p>{error}</p>
        <button className="btn" onClick={refreshData}>
          <RefreshCw className="btn-icon" />
          RETRY
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="dashboard">
      <div className="dashboard-header">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="dashboard-title">
          HVCI vs LOLDrivers
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="dashboard-subtitle">
          Real-time analysis of LOLDrivers against Microsoft's HVCI blocklist
        </motion.p>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="summary-grid">
        <div className="summary-card total">
          <h3>TOTAL DRIVERS</h3>
          <span className="summary-number">{latestData?.summary.total_drivers || 0}</span>
        </div>
        <div className="summary-card allowed">
          <h3>ALLOWED DRIVERS</h3>
          <span className="summary-number">{latestData?.summary.allowed_count || 0}</span>
          <CheckCircle className="summary-icon" />
        </div>
        <div className="summary-card blocked">
          <h3>BLOCKED DRIVERS</h3>
          <span className="summary-number">{latestData?.summary.blocked_count || 0}</span>
        </div>
      </motion.div>
      {/* Top bar: left = update date, right = action buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 16px 0' }}>
        {latestFilename && (
          <div style={{ color: '#8fa6c9', fontSize: '1.05rem', textAlign: 'left' }}>
            Microsoft Blocklist Last Update: <span style={{ color: '#5ecfff', fontWeight: 600 }}>{extractDateFromFilename(latestFilename)}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className="btn"
            onClick={refreshData}
            style={{ padding: '0.5rem', borderRadius: '50%', border: 'none', background: 'none', color: '#5ecfff', cursor: 'pointer' }}
            title="Refresh Data"
          >
            <RefreshCw className="btn-icon" />
          </button>
          {latestUrl && (
            <a
              className="btn"
              href={latestUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: '0.5rem', borderRadius: '50%', border: 'none', background: 'none', color: '#5ecfff', cursor: 'pointer' }}
              title="Export Results"
            >
              <Download className="btn-icon" />
            </a>
          )}
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="terminal-container">
        <h2 className="section-title">
          <CheckCircle className="section-icon" />
          ALLOWED DRIVERS ({latestData?.allowed_drivers.length || 0})
        </h2>
        <div className="driver-list">
          {latestData?.allowed_drivers.map((driver, index) => (
            <motion.div key={driver.sha256 || index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + index * 0.05 }} className="driver-item allowed">
              <div className="driver-info">
                <span className="driver-name">{driver.filename}</span>
                <div className="driver-hashes">
                  <span className="hash-label">SHA256:</span>
                  <span className="driver-hash">{driver.sha256 || 'N/A'}</span>
                </div>
                <div className="driver-hashes">
                  <span className="hash-label">SHA1:</span>
                  <span className="driver-hash">{driver.sha1 || 'N/A'}</span>
                </div>
                <div className="driver-hashes">
                  <span className="hash-label">MD5:</span>
                  <span className="driver-hash">{driver.md5 || 'N/A'}</span>
                </div>
              </div>
              <a href={driver.driver_link} target="_blank" rel="noopener noreferrer" className="driver-link">
                <Eye className="link-icon" />
                <span>VIEW DETAILS</span>
              </a>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard; 
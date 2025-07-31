import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const CHANGELOG_URL = "https://raw.githubusercontent.com/pwnfuzz/byovd-watchdog/main/data/jsons/byovd_changelog.json";

const getDriverLink = (driver) =>
  driver.driver_id
    ? `https://www.loldrivers.io/drivers/${driver.driver_id}`
    : undefined;

const getSHA256 = (driver) => driver.hash || driver.sha256 || driver.sha1 || driver.md5 || 'N/A';

const getStatus = (driver, section) => {
  if (driver.source === 'loldrivers') return 'New driver from loldrivers.io';
  if (driver.new_status) return driver.new_status;
  if (section === 'added') return 'Allowed';
  if (section === 'removed') return 'Blocked';
  return 'unknown';
};

const Changelog = () => {
  const [changelog, setChangelog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChangelog = async () => {
      try {
        setLoading(true);
        const res = await fetch(CHANGELOG_URL);
        if (!res.ok) throw new Error("Failed to fetch changelog");
        const data = await res.json();
        setChangelog(data);
        setError(null);
      } catch (err) {
        setError('Failed to load changelog');
      } finally {
        setLoading(false);
      }
    };
    fetchChangelog();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading"></div>
        <p>LOADING CHANGELOG...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="error-container">
        <h2>ERROR</h2>
        <p>{error}</p>
      </div>
    );
  }
  return (
    <div className="changelog">
      <div className="changelog-header">
        <h1 className="changelog-title">Changelog</h1>
        <p className="changelog-subtitle">
          View all drivers that changed status, with their hash and current status.
        </p>
      </div>
      {changelog.length === 0 ? (
        <div className="changelog-entry">
          <p>No changelog entries found.</p>
        </div>
      ) : (
        [...changelog].sort((a, b) => {
          const [da, ma, ya] = a.date.split('-').map(Number);
          const [db, mb, yb] = b.date.split('-').map(Number);
          const dateA = new Date(ya, ma - 1, da);
          const dateB = new Date(yb, mb - 1, db);
          return dateB - dateA;
        }).map((entry, idx) => {
          // Collect all drivers from added, removed, and status_changes
          const drivers = [];
          if (Array.isArray(entry.data.added)) {
            entry.data.added.forEach(driver => drivers.push({ ...driver, _section: 'added' }));
          }
          if (Array.isArray(entry.data.removed)) {
            entry.data.removed.forEach(driver => drivers.push({ ...driver, _section: 'removed' }));
          }
          if (Array.isArray(entry.data.status_changes)) {
            entry.data.status_changes.forEach(driver => drivers.push({ ...driver, _section: 'status_changes' }));
          }
          return (
            <div className="changelog-entry" key={idx}>
              <div className="entry-date" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar style={{ color: '#5ecfff', marginRight: 6 }} size={20} />
                {entry.date}
              </div>
              {drivers.length === 0 ? (
                <div style={{ color: '#8fa6c9', margin: '1rem 0' }}>No driver changes for this date.</div>
              ) : (
                <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2e3440' }}>
                      <th style={{ textAlign: 'left', color: '#b6e3ff', fontWeight: 600, padding: '6px 8px' }}>Driver Name</th>
                      <th style={{ textAlign: 'left', color: '#b6e3ff', fontWeight: 600, padding: '6px 8px' }}>Status</th>
                      <th style={{ textAlign: 'left', color: '#b6e3ff', fontWeight: 600, padding: '6px 8px' }}>SHA256 Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((driver, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #23272f' }}>
                        <td style={{ padding: '6px 8px', minWidth: 180 }}>
                          <a
                            href={getDriverLink(driver)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#5ecfff', textDecoration: 'underline', fontWeight: 'bold', fontSize: '1.08rem' }}
                          >
                            {driver.name}
                          </a>
                        </td>
                        <td style={{ padding: '6px 8px', minWidth: 80 }}>
                          <span style={{
                            color: getStatus(driver, driver._section) === 'allowed' ? '#5ecfff' : '#ff4444',
                            fontWeight: 600,
                            fontSize: '0.98rem',
                            border: '1px solid',
                            borderColor: getStatus(driver, driver._section) === 'allowed' ? '#5ecfff' : '#ff4444',
                            borderRadius: 4,
                            padding: '2px 10px',
                            textAlign: 'center',
                            background: 'rgba(94,207,255,0.07)'
                          }}>
                            {getStatus(driver, driver._section)}
                          </span>
                        </td>
                        <td style={{ color: '#8fa6c9', fontSize: '0.92rem', padding: '6px 8px', wordBreak: 'break-all', minWidth: 320 }}>
                          {getSHA256(driver)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Changelog; 
import React, { useState } from 'react';
import api from '../../services/api';

export default function Export() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (format = 'csv') => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('tecxl_admin_token');
      const response = await fetch(`/api/admin/export?format=${format}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.message || `Server responded with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tecxel_championship_results.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export download error:', err);
      alert(`Failed to download exported dataset: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="tecxl-card" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1rem', marginBottom: '12px' }}>
        CHAMPIONSHIP DATA EXPORT
      </h3>
      <p style={{ color: 'var(--color-ink-secondary)', marginBottom: '24px' }}>
        Generate and export complete records of all registered participants, round submissions, WPM, accuracy percentages, individual round scores, and overall final rankings.
      </p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleDownload('pdf')}
          disabled={downloading}
          className="btn btn-primary btn-pixel"
        >
          {downloading ? 'GENERATING...' : 'DOWNLOAD PDF 📕'}
        </button>

        <button
          onClick={() => handleDownload('doc')}
          disabled={downloading}
          className="btn btn-primary"
        >
          {downloading ? 'GENERATING...' : 'DOWNLOAD WORD (.DOC) 📘'}
        </button>

        <button
          onClick={() => handleDownload('csv')}
          disabled={downloading}
          className="btn btn-secondary"
        >
          DOWNLOAD EXCEL / CSV 📊
        </button>

        <button
          onClick={() => handleDownload('json')}
          disabled={downloading}
          className="btn btn-secondary"
        >
          DOWNLOAD RAW JSON 💾
        </button>
      </div>

      <div style={{ marginTop: '28px', borderTop: '1px solid #D0D5DD', paddingTop: '16px', fontSize: '0.85rem', color: 'var(--color-ink-muted)' }}>
        <strong>Export Fields Include:</strong> Rank, Participant ID, Full Name, Roll Number, Course, Year, Section, Disqualification Status, Round 1 (WPM, Acc, Score), Round 2, Round 3, Final Score.
      </div>
    </div>
  );
}

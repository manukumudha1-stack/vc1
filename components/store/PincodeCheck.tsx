'use client';

import { useState } from 'react';
import styles from './PincodeCheck.module.css';

export default function PincodeCheck() {
  const [pincode, setPincode]   = useState('');
  const [result, setResult]     = useState<{ serviceable: boolean; message: string } | null>(null);
  const [loading, setLoading]   = useState(false);

  async function check() {
    if (pincode.length !== 6) return;
    setLoading(true);
    setResult(null);
    try {
      const res  = await fetch(`/api/pincode/check?pin=${pincode}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ serviceable: false, message: 'Could not check. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <p className="caption" style={{ marginBottom: 10 }}>Check delivery availability</p>
      <div className={styles.row}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit pincode"
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
            setResult(null);
          }}
          className={styles.input}
          aria-label="Delivery pincode"
        />
        <button
          className={`btn btn--outline ${styles.checkBtn}`}
          onClick={check}
          disabled={pincode.length !== 6 || loading}
        >
          {loading ? 'Checking…' : 'Check'}
        </button>
      </div>
      {result && (
        <p className={`${styles.result} ${result.serviceable ? styles.resultOk : styles.resultFail}`}>
          {result.serviceable ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          )}
          {result.message}
        </p>
      )}
    </div>
  );
}

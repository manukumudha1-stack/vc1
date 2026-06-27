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

  return null;
}

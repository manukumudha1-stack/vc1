'use client';

import { useState } from 'react';
import styles from './settings.module.css';

interface PageContents {
  ourStory: string;
  theWeavers: string;
  care: string;
  shipping: string;
  returns: string;
  privacy: string;
  terms: string;
}

interface Props {
  initialData: {
    trustItems: string[];
    pageContents: PageContents;
  };
}

export default function SettingsForm({ initialData }: Props) {
  const [trustItems, setTrustItems] = useState<string[]>(
    initialData.trustItems.length >= 4
      ? initialData.trustItems.slice(0, 4)
      : [...initialData.trustItems, ...Array(4 - initialData.trustItems.length).fill('')]
  );
  const [pageContents, setPageContents] = useState<PageContents>(initialData.pageContents);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // --- Trust item helpers ---
  function updateTrustItem(index: number, value: string) {
    setTrustItems(prev => prev.map((item, i) => (i === index ? value : item)));
  }

  // --- Save ---
  async function handleSave() {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trustItems, pageContents }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Save failed');
      }
      setSuccessMsg('Settings saved successfully.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.form}>
      {/* Trust Strip */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Trust Strip</h2>
        {trustItems.map((item, i) => (
          <div key={i} className={styles.field}>
            <label className={styles.label}>Trust Item {i + 1}</label>
            <input
              type="text"
              className={styles.input}
              value={item}
              onChange={e => updateTrustItem(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Page Content */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Page Content</h2>
        <p className={styles.hint}>
          Write each page&apos;s content below. Use a blank line to separate paragraphs.
          Start a line with <code>## </code> to make it a section heading.
        </p>
        {(
          [
            { key: 'ourStory',   label: 'Our Story (/heritage)' },
            { key: 'theWeavers', label: 'The Weavers (/heritage/weavers)' },
            { key: 'care',       label: 'Care Instructions (/care)' },
            { key: 'shipping',   label: 'Shipping Policy (/shipping)' },
            { key: 'returns',    label: 'Returns & Exchange (/returns)' },
            { key: 'privacy',    label: 'Privacy Policy (/privacy)' },
            { key: 'terms',      label: 'Terms of Use (/terms)' },
          ] as { key: keyof PageContents; label: string }[]
        ).map(({ key, label }) => (
          <div key={key} className={styles.field}>
            <label className={styles.label}>{label}</label>
            <textarea
              className={styles.textarea}
              rows={8}
              value={pageContents[key]}
              onChange={e => setPageContents(prev => ({ ...prev, [key]: e.target.value }))}
              placeholder={`Write content for ${label}…`}
            />
          </div>
        ))}
      </div>

      {successMsg && <p className={styles.success}>{successMsg}</p>}
      {errorMsg && <p className={styles.error}>{errorMsg}</p>}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btnSave}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

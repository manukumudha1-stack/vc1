'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ProductForm.module.css';

interface LookbookFormData {
  _id?: string;
  imageUrl: string;
  caption: string;
  sortOrder: number | string;
  isActive: boolean;
}

interface Props {
  initialData?: Partial<LookbookFormData>;
  mode: 'new' | 'edit';
}

export default function LookbookForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<LookbookFormData>({
    imageUrl:  initialData?.imageUrl  ?? '',
    caption:   initialData?.caption   ?? '',
    sortOrder: initialData?.sortOrder ?? 0,
    isActive:  initialData?.isActive  ?? true,
    _id:       initialData?._id,
  });

  function setField<K extends keyof LookbookFormData>(key: K, value: LookbookFormData[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleImageChange(file: File) {
    setUploading(true);
    setError('');
    try {
      const sigRes  = await fetch('/api/upload', { method: 'POST' });
      const sigData = await sigRes.json();
      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key',   sigData.apiKey);
      fd.append('timestamp', sigData.timestamp);
      fd.append('signature', sigData.signature);
      fd.append('folder',    sigData.folder || 'vc-sarees');
      const cloudRes  = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, { method: 'POST', body: fd });
      const cloudData = await cloudRes.json();
      if (cloudData.secure_url) {
        setField('imageUrl', cloudData.secure_url);
      } else {
        setError('Image upload failed. Please try again.');
      }
    } catch {
      setError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.imageUrl) { setError('Please upload an image.'); return; }
    setError(''); setSuccess(''); setSaving(true);
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) };
      const res = mode === 'new'
        ? await fetch('/api/lookbook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch(`/api/lookbook/${form._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      setSuccess('Saved successfully.');
      setTimeout(() => router.push('/admin/settings'), 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error   && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Image</div>

        <div className={styles.field}>
          <div
            className={styles.imageSlot}
            style={{ width: 220, height: 293, cursor: 'pointer' }}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <span className={styles.uploading}>Uploading…</span>
            ) : form.imageUrl ? (
              <>
                <img src={form.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <div className={styles.imageSlotOverlay}>
                  <span className={styles.imageSlotOverlayText}>Change</span>
                </div>
              </>
            ) : (
              <div className={styles.imageSlotEmpty}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4v12M4 10h12" stroke="#8C7B6B" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Upload image</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileRef}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImageChange(f); }}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Details</div>

        <div className={styles.field}>
          <label className={styles.label}>Caption</label>
          <input
            className={styles.input}
            value={form.caption}
            onChange={e => setField('caption', e.target.value)}
            placeholder="e.g. Bridal — Kanjivaram Ruby"
          />
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label}>Sort Order</label>
            <input
              className={styles.input}
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={e => setField('sortOrder', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Visibility</label>
            <select
              className={styles.select}
              value={form.isActive ? 'true' : 'false'}
              onChange={e => setField('isActive', e.target.value === 'true')}
            >
              <option value="true">Visible</option>
              <option value="false">Hidden</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.btnSave} disabled={saving}>
          {saving ? 'Saving…' : mode === 'new' ? 'Add to Lookbook' : 'Save Changes'}
        </button>
        <a href="/admin/settings" className={styles.btnCancel}>Cancel</a>
      </div>
    </form>
  );
}

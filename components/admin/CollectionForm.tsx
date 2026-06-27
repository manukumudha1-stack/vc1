'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ProductForm.module.css';

interface CollectionFormData {
  _id?: string;
  slug?: string;
  name: string;
  description: string;
  coverImageUrl: string;
  sortOrder: number | string;
}

interface Props {
  initialData?: Partial<CollectionFormData>;
  mode: 'new' | 'edit';
}

export default function CollectionForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<CollectionFormData>({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    coverImageUrl: initialData?.coverImageUrl ?? '',
    sortOrder: initialData?.sortOrder ?? '',
    _id: initialData?._id,
    slug: initialData?.slug,
  });

  function setField(key: keyof CollectionFormData, value: string | number) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleCoverImageChange(file: File) {
    setUploading(true);
    setError('');
    try {
      const sigRes = await fetch('/api/upload', { method: 'POST' });
      const sigData = await sigRes.json();
      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sigData.apiKey);
      fd.append('timestamp', sigData.timestamp);
      fd.append('signature', sigData.signature);
      fd.append('folder', sigData.folder || 'vc-sarees');
      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`,
        { method: 'POST', body: fd }
      );
      const cloudData = await cloudRes.json();
      if (cloudData.secure_url) {
        setField('coverImageUrl', cloudData.secure_url);
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
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        sortOrder: form.sortOrder === '' ? 0 : Number(form.sortOrder),
      };

      let res: Response;
      if (mode === 'new') {
        res = await fetch('/api/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/collections/${form.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save collection');
      }
      setSuccess('Collection saved successfully.');
      setTimeout(() => router.push('/admin/collections'), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save collection.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Collection Details</div>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label}>Name *</label>
            <input
              className={styles.input}
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              placeholder="e.g. Ilkal Silk"
              required
            />
            {form.slug && (
              <div style={{ fontSize: 11, color: '#8C7B6B', marginTop: 4 }}>Slug: {form.slug}</div>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Sort Order</label>
            <input
              className={styles.input}
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={e => setField('sortOrder', e.target.value)}
              placeholder="1"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={form.description}
            onChange={e => setField('description', e.target.value)}
            rows={3}
            placeholder="Short description shown on the collections listing page…"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Cover Image</label>
          <div
            className={styles.imageSlot}
            style={{ width: 200, height: 260, cursor: 'pointer' }}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <span className={styles.uploading}>Uploading…</span>
            ) : form.coverImageUrl ? (
              <>
                <img
                  src={form.coverImageUrl}
                  alt="Cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className={styles.imageSlotOverlay}>
                  <span className={styles.imageSlotOverlayText}>Change</span>
                </div>
              </>
            ) : (
              <div className={styles.imageSlotEmpty}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4v12M4 10h12" stroke="#8C7B6B" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Add cover image</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileRef}
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleCoverImageChange(f);
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btnCancel}
          onClick={() => router.push('/admin/collections')}
        >
          Cancel
        </button>
        <button type="submit" className={styles.btnSave} disabled={saving}>
          {saving ? 'Saving…' : mode === 'new' ? 'Create Collection' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

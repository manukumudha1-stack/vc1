'use client';

import { useState } from 'react';
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
          <label className={styles.label}>Cover Image URL</label>
          <input
            className={styles.input}
            value={form.coverImageUrl}
            onChange={e => setField('coverImageUrl', e.target.value)}
            placeholder="https://res.cloudinary.com/…"
          />
          {form.coverImageUrl && (
            <img
              src={form.coverImageUrl}
              alt="Cover preview"
              style={{ marginTop: 8, maxWidth: 200, borderRadius: 4 }}
            />
          )}
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

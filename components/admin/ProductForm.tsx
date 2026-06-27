'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ProductForm.module.css';

interface Collection {
  _id: string;
  name: string;
  slug: string;
}

interface ProductFormData {
  _id?: string;
  slug?: string;
  name: string;
  sku: string;
  collectionId: string;
  fabric: string;
  region: string;
  zariType: string;
  occasion: string;
  price: number | string;
  stockQty: number | string;
  blousePiece: string;
  weaver: string;
  makerImageUrl: string;
  description: string;
  story: string;
  careInstructions: string;
  images: string[];
}

interface Props {
  initialData?: Partial<ProductFormData> & { isFeatured?: boolean };
  mode: 'new' | 'edit';
}

function generateSKU() {
  const now  = new Date();
  const yy   = String(now.getFullYear()).slice(2);
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `VC-${yy}${mm}${dd}-${rand}`;
}

const OCCASIONS = ['Wedding', 'Festival', 'Daily Wear', 'Party', 'Office'];
const BLOUSE_OPTIONS = [
  { value: 'included', label: 'Included' },
  { value: 'not_included', label: 'Not Included' },
  { value: 'on_request', label: 'On Request' },
];

export default function ProductForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [images, setImages] = useState<string[]>(initialData?.images ?? Array(6).fill(''));
  const [uploading, setUploading] = useState<number | null>(null);
  const [makerImageUrl, setMakerImageUrl] = useState(initialData?.makerImageUrl ?? '');
  const [uploadingMaker, setUploadingMaker] = useState(false);
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured === true);
  const [sku] = useState<string>(() => initialData?.sku || generateSKU());
  const makerFileRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name ?? '',
    sku: '',
    collectionId: initialData?.collectionId ?? '',
    fabric: initialData?.fabric ?? '',
    region: initialData?.region ?? '',
    zariType: initialData?.zariType ?? '',
    occasion: initialData?.occasion ?? '',
    price: initialData?.price ?? '',
    stockQty: initialData?.stockQty ?? '',
    blousePiece: initialData?.blousePiece ?? 'included',
    weaver: initialData?.weaver ?? '',
    makerImageUrl: initialData?.makerImageUrl ?? '',
    description: initialData?.description ?? '',
    story: initialData?.story ?? '',
    careInstructions: initialData?.careInstructions ?? '',
    images: initialData?.images ?? [],
    _id: initialData?._id,
    slug: initialData?.slug,
  });

  useEffect(() => {
    fetch('/api/collections')
      .then(r => r.json())
      .then(data => setCollections(data.collections ?? data ?? []))
      .catch(() => {});
  }, []);

  function setField(key: keyof ProductFormData, value: string | number) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleImageSlotClick(idx: number) {
    fileRefs.current[idx]?.click();
  }

  async function handleFileChange(idx: number, file: File) {
    if (!file) return;
    setUploading(idx);
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
        const newImages = [...images];
        newImages[idx] = cloudData.secure_url;
        setImages(newImages);
      }
    } catch {
      setError('Image upload failed. Please try again.');
    } finally {
      setUploading(null);
    }
  }

  async function handleMakerFileChange(file: File) {
    setUploadingMaker(true);
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
      if (cloudData.secure_url) setMakerImageUrl(cloudData.secure_url);
      else setError('Maker image upload failed. Please try again.');
    } catch {
      setError('Maker image upload failed. Please try again.');
    } finally {
      setUploadingMaker(false);
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
        sku,
        price: Number(form.price),
        stockQty: Number(form.stockQty),
        occasion: typeof form.occasion === 'string'
          ? form.occasion.split(',').map(s => s.trim()).filter(Boolean)
          : form.occasion,
        images: images.filter(Boolean).map(url => ({ url, caption: '', cloudinaryId: '' })),
        makerImageUrl,
        isFeatured,
      };

      let res: Response;
      if (mode === 'new') {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // API route is keyed by slug
        const identifier = form.slug || form._id;
        res = await fetch(`/api/products/${identifier}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save product');
      }
      setSuccess('Product saved successfully.');
      setTimeout(() => router.push('/admin/products'), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      {/* Images */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Product Images</div>
        <div className={styles.imageGrid}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className={styles.imageSlot}
              onClick={() => handleImageSlotClick(idx)}
            >
              {uploading === idx ? (
                <span className={styles.uploading}>Uploading…</span>
              ) : images[idx] ? (
                <>
                  <img src={images[idx]} alt={`Image ${idx + 1}`} />
                  <div className={styles.imageSlotOverlay}>
                    <span className={styles.imageSlotOverlayText}>Change</span>
                  </div>
                </>
              ) : (
                <div className={styles.imageSlotEmpty}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4v12M4 10h12" stroke="#8C7B6B" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>Add image</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={el => { fileRefs.current[idx] = el; }}
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleFileChange(idx, f);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Basic Info */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Product Details</div>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label}>Product Name</label>
            <input
              className={styles.input}
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              placeholder="e.g. Lakshmi Temple-Border Kanjivaram"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>SKU <span className={styles.labelNote}>auto-generated</span></label>
            <div className={styles.skuDisplay}>{sku}</div>
          </div>
        </div>

        <div className={styles.grid3}>
          <div className={styles.field}>
            <label className={styles.label}>Collection</label>
            <select
              className={styles.select}
              value={form.collectionId}
              onChange={e => setField('collectionId', e.target.value)}
              required
            >
              <option value="">Select collection…</option>
              {collections.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Fabric</label>
            <input
              className={styles.input}
              value={form.fabric}
              onChange={e => setField('fabric', e.target.value)}
              placeholder="e.g. Pure Silk"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Region</label>
            <input
              className={styles.input}
              value={form.region}
              onChange={e => setField('region', e.target.value)}
              placeholder="e.g. Kanchipuram"
            />
          </div>
        </div>

        <div className={styles.grid3}>
          <div className={styles.field}>
            <label className={styles.label}>Zari Type</label>
            <input
              className={styles.input}
              value={form.zariType}
              onChange={e => setField('zariType', e.target.value)}
              placeholder="e.g. Pure Zari"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Occasion (comma-separated)</label>
            <input
              className={styles.input}
              value={form.occasion}
              onChange={e => setField('occasion', e.target.value)}
              placeholder={OCCASIONS.join(', ')}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Weaver</label>
            <input
              className={styles.input}
              value={form.weaver}
              onChange={e => setField('weaver', e.target.value)}
              placeholder="Weaver name or workshop"
            />
          </div>
        </div>

        <div className={styles.grid3}>
          <div className={styles.field}>
            <label className={styles.label}>Price (₹)</label>
            <input
              className={styles.input}
              type="number"
              min={0}
              value={form.price}
              onChange={e => setField('price', e.target.value)}
              placeholder="e.g. 48500"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Stock Qty</label>
            <input
              className={styles.input}
              type="number"
              min={0}
              value={form.stockQty}
              onChange={e => setField('stockQty', e.target.value)}
              placeholder="e.g. 1"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Blouse Piece</label>
            <select
              className={styles.select}
              value={form.blousePiece}
              onChange={e => setField('blousePiece', e.target.value)}
            >
              {BLOUSE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <label className={styles.toggleRow}>
          <div
            className={`${styles.toggle} ${isFeatured ? styles.toggleOn : ''}`}
            onClick={() => setIsFeatured(v => !v)}
            role="switch"
            aria-checked={isFeatured}
            tabIndex={0}
            onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') setIsFeatured(v => !v); }}
          >
            <div className={styles.toggleThumb} />
          </div>
          <div>
            <div className={styles.toggleLabel}>Feature on homepage</div>
            <div className={styles.toggleHint}>Shown in the Featured Sarees section. If none are featured, top-stock products appear instead.</div>
          </div>
        </label>
      </div>

      {/* Story */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Story & Details</div>

        <div className={styles.field}>
          <label className={styles.label}>Maker&rsquo;s Image</label>
          <div
            className={styles.imageSlot}
            style={{ width: 160, height: 160, borderRadius: 8, cursor: 'pointer' }}
            onClick={() => makerFileRef.current?.click()}
          >
            {uploadingMaker ? (
              <span className={styles.uploading}>Uploading…</span>
            ) : makerImageUrl ? (
              <>
                <img src={makerImageUrl} alt="Maker" />
                <div className={styles.imageSlotOverlay}>
                  <span className={styles.imageSlotOverlayText}>Change</span>
                </div>
              </>
            ) : (
              <div className={styles.imageSlotEmpty}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4v12M4 10h12" stroke="#8C7B6B" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Add photo</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={makerFileRef}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleMakerFileChange(f); }}
            />
          </div>
          <p style={{ fontSize: 12, color: '#8C7B6B', marginTop: 6 }}>
            Photo of the weaver or workshop — shown in the Maker&rsquo;s Note section on the product page.
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={form.description}
            onChange={e => setField('description', e.target.value)}
            placeholder="Short product description…"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Weaver's Story</label>
          <textarea
            className={styles.textarea}
            value={form.story}
            onChange={e => setField('story', e.target.value)}
            placeholder="The story behind this saree…"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Care Instructions</label>
          <textarea
            className={styles.textarea}
            style={{ minHeight: 72 }}
            value={form.careInstructions}
            onChange={e => setField('careInstructions', e.target.value)}
            placeholder="e.g. Dry clean only. Store in muslin…"
          />
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.btnSave} type="submit" disabled={saving}>
          {saving ? 'Saving…' : mode === 'new' ? 'Create Product' : 'Save Changes'}
        </button>
        <a href="/admin/products" className={styles.btnCancel}>Cancel</a>
      </div>
    </form>
  );
}

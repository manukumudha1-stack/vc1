'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cart';
import { formatINR } from '@/lib/utils';
import styles from './page.module.css';

type Step = 1 | 2 | 3;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{10,13}$/;

interface AddressForm {
  email: string;
  name: string;
  phone: string;
  line1: string;
  landmark: string;
  city: string;
  pincode: string;
  state: string;
}

interface SavedAddress {
  _id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  landmark: string;
  city: string;
  pincode: string;
  state: string;
}

const EMPTY_ADDRESS: AddressForm = {
  email: '', name: '', phone: '', line1: '', landmark: '', city: '', pincode: '', state: '',
};

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

export default function CheckoutPage() {
  const router        = useRouter();
  const { data: session } = useSession();
  const items         = useCartStore((s) => s.items);
  const clearCart     = useCartStore((s) => s.clearCart);
  const total         = useCartStore((s) => s.total);

  const [step, setStep]         = useState<Step>(1);
  const [address, setAddress]   = useState<AddressForm>(EMPTY_ADDRESS);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedIdx, setSelectedIdx]       = useState<number | 'new'>('new');
  const [saveAddress, setSaveAddress]       = useState(false);
  const [addressLabel, setAddressLabel]     = useState('Home');
  const [editingId, setEditingId]           = useState<string | null>(null);
  const [editForm, setEditForm]             = useState({ label: 'Home', name: '', phone: '', line1: '', landmark: '', city: '', pincode: '', state: '' });

  const [freeShippingThreshold, setFreeShippingThreshold] = useState(5000);
  const [trustItems, setTrustItems] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/site-config')
      .then(r => r.json())
      .then((cfg: { freeShippingThreshold?: number; trustItems?: string[] }) => {
        if (typeof cfg.freeShippingThreshold === 'number') {
          setFreeShippingThreshold(cfg.freeShippingThreshold);
        }
        if (Array.isArray(cfg.trustItems) && cfg.trustItems.length > 0) {
          setTrustItems(cfg.trustItems);
        }
      })
      .catch(() => {});
  }, []);

  const subtotal        = total();
  const shippingFree    = subtotal >= freeShippingThreshold;
  const shippingDisplay = shippingFree ? 'Free' : 'Added into product cost';
  const grandTotal      = subtotal;

  useEffect(() => {
    if (!session?.user?.email) return;
    fetch('/api/user/addresses')
      .then(r => r.ok ? r.json() : { addresses: [] })
      .then(({ addresses = [] }: { addresses: SavedAddress[] }) => {
        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          setSelectedIdx(0);
          setAddress({
            email: session.user!.email ?? '',
            name: addresses[0].name,
            phone: addresses[0].phone,
            line1: addresses[0].line1,
            landmark: addresses[0].landmark,
            city: addresses[0].city,
            pincode: addresses[0].pincode,
            state: addresses[0].state,
          });
        } else {
          setAddress(prev => ({ ...prev, email: session.user!.email ?? '' }));
        }
      })
      .catch(() => {});
  }, [session?.user?.email, session?.user]);

  function pickSaved(idx: number) {
    const a = savedAddresses[idx];
    setSelectedIdx(idx);
    setAddress({
      email: session?.user?.email ?? '',
      name: a.name,
      phone: a.phone,
      line1: a.line1,
      landmark: a.landmark,
      city: a.city,
      pincode: a.pincode,
      state: a.state,
    });
  }

  function pickNew() {
    setSelectedIdx('new');
    setAddress({ ...EMPTY_ADDRESS, email: session?.user?.email ?? '' });
  }

  async function deleteAddress(id: string, idx: number, e: React.MouseEvent) {
    e.stopPropagation();
    const res = await fetch(`/api/user/addresses?id=${id}&idx=${idx}`, { method: 'DELETE' });
    if (!res.ok) return;
    const { addresses }: { addresses: SavedAddress[] } = await res.json();
    setSavedAddresses(addresses);
    if (addresses.length === 0) {
      pickNew();
    } else if (typeof selectedIdx === 'number' && selectedIdx >= addresses.length) {
      pickSaved(0);
    }
  }

  function startEdit(a: SavedAddress, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(String(a._id));
    setEditForm({ label: a.label, name: a.name, phone: a.phone, line1: a.line1, landmark: a.landmark, city: a.city, pincode: a.pincode, state: a.state });
  }

  async function saveEdit() {
    if (!editingId) return;
    const res = await fetch(`/api/user/addresses?id=${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    if (!res.ok) return;
    const { addresses }: { addresses: SavedAddress[] } = await res.json();
    setSavedAddresses(addresses);
    if (typeof selectedIdx === 'number') {
      const updated = addresses.find(x => String(x._id) === editingId);
      if (updated) {
        const updatedIdx = addresses.findIndex(x => String(x._id) === editingId);
        if (updatedIdx === selectedIdx) {
          setAddress(prev => ({ ...prev, name: updated.name, phone: updated.phone, line1: updated.line1, landmark: updated.landmark, city: updated.city, pincode: updated.pincode, state: updated.state }));
        }
      }
    }
    setEditingId(null);
  }

  function updateField(field: keyof AddressForm, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (field === 'email') setEmailError('');
    if (field === 'phone') setPhoneError('');
  }

  function validateAddress(): boolean {
    let valid = true;
    const required: (keyof AddressForm)[] = ['name', 'line1', 'city', 'pincode', 'state'];
    if (required.some((f) => address[f].trim().length === 0)) valid = false;

    if (!address.email.trim()) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!EMAIL_RE.test(address.email)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }

    const cleanPhone = address.phone.replace(/\s/g, '');
    if (!cleanPhone) {
      setPhoneError('Phone number is required.');
      valid = false;
    } else if (!PHONE_RE.test(cleanPhone)) {
      setPhoneError('Enter a valid 10-digit phone number.');
      valid = false;
    } else {
      setPhoneError('');
    }

    return valid;
  }

  async function placeOrder() {
    if (!validateAddress()) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            name:      i.name,
            sku:       i.sku,
            price:     i.price,
            qty:       i.qty,
            image:     i.image ?? '',
          })),
          shippingAddress: {
            email:    address.email,
            name:     address.name,
            phone:    address.phone,
            line1:    address.line1,
            landmark: address.landmark,
            city:     address.city,
            pincode:  address.pincode,
            state:    address.state,
          },
          payment: { method: 'COD', provider: 'cod' },
          subtotal,
          total: grandTotal,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to place order');
      }

      const order = await res.json();

      if (session?.user?.email && saveAddress && selectedIdx === 'new') {
        fetch('/api/user/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            label:    addressLabel || 'Home',
            name:     address.name,
            phone:    address.phone,
            line1:    address.line1,
            landmark: address.landmark,
            city:     address.city,
            pincode:  address.pincode,
            state:    address.state,
          }),
        }).catch(() => {});
      }

      clearCart();
      router.push(`/orders/${order.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (items.length === 0 && step === 1) {
    return (
      <div className={styles.empty}>
        <p className={`serif ${styles.emptyTitle}`}>Your bag is empty</p>
        <Link href="/collections" className="btn btn--gold" style={{ marginTop: 24 }}>
          Shop now
        </Link>
      </div>
    );
  }

  const showForm = savedAddresses.length === 0 || selectedIdx === 'new';

  return (
    <div className={styles.page}>
      {/* Progress bar */}
      <div className={styles.progress}>
        {(['Address', 'Payment', 'Review'] as const).map((label, i) => {
          const stepNum = (i + 1) as Step;
          return (
            <div key={label} className={`${styles.progressStep} ${step >= stepNum ? styles.progressActive : ''}`}>
              <div className={styles.progressDot}>{step > stepNum ? '✓' : stepNum}</div>
              <span className={styles.progressLabel}>{label}</span>
              {i < 2 && <div className={`${styles.progressLine} ${step > stepNum ? styles.progressLineDone : ''}`} />}
            </div>
          );
        })}
      </div>

      <div className={styles.body}>
        {/* Left: form */}
        <div className={styles.form}>
          {/* Step 1: Address */}
          {step === 1 && (
            <div className={styles.formSection}>
              <h2 className={`serif ${styles.formTitle}`}>Delivery Address</h2>

              {/* Saved address cards */}
              {savedAddresses.length > 0 && (
                <div className={styles.savedAddresses}>
                  <p className={styles.savedAddressesTitle}>Saved addresses</p>
                  {savedAddresses.map((a, i) => {
                    const id = String(a._id);
                    return (
                    <div
                      key={id}
                      className={`${styles.addressCard} ${selectedIdx === i && editingId !== id ? styles.addressCardSelected : ''} ${editingId === id ? styles.addressCardEditing : ''}`}
                      onClick={() => editingId !== id && pickSaved(i)}
                    >
                      {editingId === id ? (
                        /* ── Inline edit form ── */
                        <div className={styles.editFormWrap} onClick={e => e.stopPropagation()}>
                          <p className={styles.savedAddressesTitle} style={{ marginBottom: 14 }}>Edit address</p>
                          <div className={styles.fieldGrid}>
                            <div className={styles.field}>
                              <label className={styles.label}>Label</label>
                              <input className={styles.input} value={editForm.label} onChange={e => setEditForm(p => ({ ...p, label: e.target.value }))} placeholder="Home / Office" />
                            </div>
                            <div className={styles.field}>
                              <label className={styles.label}>Full Name *</label>
                              <input className={styles.input} value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
                            </div>
                            <div className={styles.field}>
                              <label className={styles.label}>Phone *</label>
                              <input type="tel" className={styles.input} value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
                            </div>
                            <div className={`${styles.field} ${styles.fieldFull}`}>
                              <label className={styles.label}>Address *</label>
                              <input className={styles.input} value={editForm.line1} onChange={e => setEditForm(p => ({ ...p, line1: e.target.value }))} placeholder="House no., Street, Area" />
                            </div>
                            <div className={`${styles.field} ${styles.fieldFull}`}>
                              <label className={styles.label}>Landmark</label>
                              <input className={styles.input} value={editForm.landmark} onChange={e => setEditForm(p => ({ ...p, landmark: e.target.value }))} placeholder="Near landmark (optional)" />
                            </div>
                            <div className={styles.field}>
                              <label className={styles.label}>City *</label>
                              <input className={styles.input} value={editForm.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} placeholder="City" />
                            </div>
                            <div className={styles.field}>
                              <label className={styles.label}>Pincode *</label>
                              <input className={styles.input} inputMode="numeric" maxLength={6} value={editForm.pincode} onChange={e => setEditForm(p => ({ ...p, pincode: e.target.value.replace(/\D/g, '') }))} placeholder="6-digit pincode" />
                            </div>
                            <div className={`${styles.field} ${styles.fieldFull}`}>
                              <label className={styles.label}>State *</label>
                              <select className={`${styles.input} ${styles.select}`} value={editForm.state} onChange={e => setEditForm(p => ({ ...p, state: e.target.value }))}>
                                <option value="">Select state</option>
                                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className={styles.editActions}>
                            <button type="button" className="btn btn--gold" style={{ padding: '10px 24px', fontSize: 13 }} onClick={saveEdit}>Save Changes</button>
                            <button type="button" className="btn btn--outline" style={{ padding: '10px 20px', fontSize: 13 }} onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        /* ── Normal card view ── */
                        <>
                          <div className={`${styles.addressRadio} ${selectedIdx === i ? styles.addressRadioSelected : ''}`}>
                            {selectedIdx === i && <div className={styles.addressRadioDot} />}
                          </div>
                          <div className={styles.addressCardBody}>
                            <p className={styles.addressCardLabel}>{a.label}</p>
                            <p className={styles.addressCardText}>{a.name} · {a.phone}</p>
                            <p className={styles.addressCardText}>
                              {a.line1}{a.landmark ? `, ${a.landmark}` : ''}, {a.city}, {a.state} – {a.pincode}
                            </p>
                          </div>
                          <div className={styles.addressCardActions}>
                            <button type="button" className={styles.addressCardEdit} onClick={(e) => startEdit(a, e)} aria-label="Edit address">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button type="button" className={styles.addressCardDelete} onClick={(e) => deleteAddress(id, i, e)} aria-label="Remove address">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );})}

                  {/* New address option */}
                  <div
                    className={`${styles.addressCard} ${selectedIdx === 'new' ? styles.addressCardSelected : ''}`}
                    onClick={pickNew}
                  >
                    <div className={`${styles.addressRadio} ${selectedIdx === 'new' ? styles.addressRadioSelected : ''}`}>
                      {selectedIdx === 'new' && <div className={styles.addressRadioDot} />}
                    </div>
                    <div className={styles.addressCardBody}>
                      <p className={styles.addressCardLabel}>+ Use a new address</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Address form */}
              {showForm && (
                <div className={styles.fieldGrid}>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Email *</label>
                    <input
                      type="email"
                      className={styles.input}
                      value={address.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      onBlur={() => {
                        if (!address.email.trim()) setEmailError('Email is required.');
                        else if (!EMAIL_RE.test(address.email)) setEmailError('Please enter a valid email address.');
                        else setEmailError('');
                      }}
                      placeholder="you@email.com"
                      style={emailError ? { borderColor: '#c0392b' } : undefined}
                    />
                    {emailError && <p className={styles.fieldError}>{emailError}</p>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Full Name *</label>
                    <input type="text" className={styles.input} value={address.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Your name" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Phone *</label>
                    <input
                      type="tel"
                      className={styles.input}
                      value={address.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      onBlur={() => {
                        const clean = address.phone.replace(/\s/g, '');
                        if (!clean) setPhoneError('Phone number is required.');
                        else if (!PHONE_RE.test(clean)) setPhoneError('Enter a valid 10-digit phone number.');
                        else setPhoneError('');
                      }}
                      placeholder="+91 98765 43210"
                      style={phoneError ? { borderColor: '#c0392b' } : undefined}
                    />
                    {phoneError && <p className={styles.fieldError}>{phoneError}</p>}
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Address *</label>
                    <input type="text" className={styles.input} value={address.line1} onChange={(e) => updateField('line1', e.target.value)} placeholder="House no., Street, Area" />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Landmark</label>
                    <input type="text" className={styles.input} value={address.landmark} onChange={(e) => updateField('landmark', e.target.value)} placeholder="Near landmark (optional)" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>City *</label>
                    <input type="text" className={styles.input} value={address.city} onChange={(e) => updateField('city', e.target.value)} placeholder="City" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Pincode *</label>
                    <input type="text" inputMode="numeric" maxLength={6} className={styles.input} value={address.pincode} onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, ''))} placeholder="6-digit pincode" />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>State *</label>
                    <select className={`${styles.input} ${styles.select}`} value={address.state} onChange={(e) => updateField('state', e.target.value)}>
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Save address option for logged-in users */}
                  {session?.user && (
                    <div className={`${styles.fieldFull} ${styles.saveRow}`}>
                      <label className={styles.saveRowCheck}>
                        <input
                          type="checkbox"
                          checked={saveAddress}
                          onChange={e => setSaveAddress(e.target.checked)}
                          style={{ accentColor: '#C9A84C', width: 16, height: 16, cursor: 'pointer' }}
                        />
                        Save this address for future orders
                      </label>
                      {saveAddress && (
                        <input
                          type="text"
                          className={styles.input}
                          value={addressLabel}
                          onChange={e => setAddressLabel(e.target.value)}
                          placeholder="Label, e.g. Home or Office"
                          style={{ maxWidth: 220, marginTop: 10 }}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {error && <p className={styles.error}>{error}</p>}

              <button
                className={`btn btn--gold ${styles.nextBtn}`}
                onClick={() => {
                  if (!validateAddress()) {
                    setError('Please fill in all required fields.');
                    return;
                  }
                  setError('');
                  setStep(2);
                }}
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className={styles.formSection}>
              <h2 className={`serif ${styles.formTitle}`}>Payment Method</h2>

              <div className={`${styles.payOption} ${styles.payOptionActive}`}>
                <div className={styles.payRadio}>
                  <div className={styles.payRadioDot} />
                </div>
                <div className={styles.payInfo}>
                  <p className={styles.payLabel}>Cash on Delivery</p>
                  <p className={styles.payMeta}>Pay when your order arrives. No upfront payment.</p>
                </div>
                <span className={`badge badge--confirmed ${styles.payBadge}`}>Available</span>
              </div>

              <div className={`${styles.payOption} ${styles.payOptionDisabled}`}>
                <div className={styles.payRadio} />
                <div className={styles.payInfo}>
                  <p className={styles.payLabel}>UPI</p>
                  <p className={styles.payMeta}>PhonePe, Google Pay, Paytm &amp; more</p>
                </div>
                <span className={`badge badge--new ${styles.payBadge}`}>Coming soon</span>
              </div>

              <div className={`${styles.payOption} ${styles.payOptionDisabled}`}>
                <div className={styles.payRadio} />
                <div className={styles.payInfo}>
                  <p className={styles.payLabel}>Credit / Debit Card</p>
                  <p className={styles.payMeta}>Visa, Mastercard, RuPay</p>
                </div>
                <span className={`badge badge--new ${styles.payBadge}`}>Coming soon</span>
              </div>

              <div className={styles.stepNav}>
                <button className="btn btn--outline" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn--gold" onClick={() => setStep(3)}>Review Order</button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className={styles.formSection}>
              <h2 className={`serif ${styles.formTitle}`}>Review &amp; Confirm</h2>

              <div className={styles.reviewBlock}>
                <div className={styles.reviewBlockHead}>
                  <p className="eyebrow">Delivery address</p>
                  <button className={styles.editLink} onClick={() => setStep(1)}>Edit</button>
                </div>
                <p className={styles.reviewText}>{address.name} · {address.phone}</p>
                <p className={styles.reviewText}>{address.line1}{address.landmark ? `, ${address.landmark}` : ''}</p>
                <p className={styles.reviewText}>{address.city}, {address.state} – {address.pincode}</p>
              </div>

              <div className={styles.reviewBlock}>
                <div className={styles.reviewBlockHead}>
                  <p className="eyebrow">Payment</p>
                  <button className={styles.editLink} onClick={() => setStep(2)}>Edit</button>
                </div>
                <p className={styles.reviewText}>Cash on Delivery</p>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.stepNav}>
                <button className="btn btn--outline" onClick={() => setStep(2)}>Back</button>
                <button
                  className="btn btn--gold"
                  onClick={placeOrder}
                  disabled={loading}
                  style={{ minWidth: 180 }}
                >
                  {loading ? 'Placing order…' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: order summary */}
        <aside className={styles.summary}>
          <h3 className={`serif ${styles.summaryTitle}`}>Order Summary</h3>
          <hr className="hairline-rule" />

          <ul className={styles.summaryItems}>
            {items.map((item) => (
              <li key={item.productId} className={styles.summaryItem}>
                <div className={`ph ${styles.summaryThumb}`}>
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div className={styles.summaryItemInfo}>
                  <p className={styles.summaryItemName}>{item.name}</p>
                  <p className="caption">Qty: {item.qty}</p>
                  <p className="price" style={{ fontSize: 14 }}>{formatINR(item.price * item.qty)}</p>
                </div>
              </li>
            ))}
          </ul>

          <hr className="hairline-rule" />

          <div className={styles.summaryRow}>
            <span className={styles.summaryKey}>Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryKey}>Shipping</span>
            <span style={shippingFree ? undefined : { fontSize: 12, color: '#888' }}>{shippingDisplay}</span>
          </div>
          <hr className="hairline-rule" />
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>Total</span>
            <span className="price">{formatINR(grandTotal)}</span>
          </div>

          <div className={styles.assurances}>
            {trustItems.map((a) => (
              <div key={a} className={styles.assuranceItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>{a}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

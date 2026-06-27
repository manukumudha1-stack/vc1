'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { formatINR } from '@/lib/utils';
import styles from './page.module.css';

type Step = 1 | 2 | 3;

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
  const router    = useRouter();
  const items     = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const total     = useCartStore((s) => s.total);

  const [step, setStep]       = useState<Step>(1);
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const subtotal     = total();
  const shippingCost = subtotal >= 5000 ? 0 : 199;
  const grandTotal   = subtotal + shippingCost;

  function updateField(field: keyof AddressForm, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  function validateAddress(): boolean {
    const required: (keyof AddressForm)[] = ['email', 'name', 'phone', 'line1', 'city', 'pincode', 'state'];
    return required.every((f) => address[f].trim().length > 0);
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
        <a href="/collections" className="btn btn--gold" style={{ marginTop: 24 }}>
          Shop now
        </a>
      </div>
    );
  }

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

              <div className={styles.fieldGrid}>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>Email *</label>
                  <input type="email" className={styles.input} value={address.email} onChange={(e) => updateField('email', e.target.value)} placeholder="you@email.com" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Full Name *</label>
                  <input type="text" className={styles.input} value={address.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Your name" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Phone *</label>
                  <input type="tel" className={styles.input} value={address.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+91 98765 43210" />
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
              </div>

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

              {/* COD - primary */}
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

              {/* UPI - coming soon */}
              <div className={`${styles.payOption} ${styles.payOptionDisabled}`}>
                <div className={styles.payRadio} />
                <div className={styles.payInfo}>
                  <p className={styles.payLabel}>UPI</p>
                  <p className={styles.payMeta}>PhonePe, Google Pay, Paytm & more</p>
                </div>
                <span className={`badge badge--new ${styles.payBadge}`}>Coming soon</span>
              </div>

              {/* Card - coming soon */}
              <div className={`${styles.payOption} ${styles.payOptionDisabled}`}>
                <div className={styles.payRadio} />
                <div className={styles.payInfo}>
                  <p className={styles.payLabel}>Credit / Debit Card</p>
                  <p className={styles.payMeta}>Visa, Mastercard, RuPay</p>
                </div>
                <span className={`badge badge--new ${styles.payBadge}`}>Coming soon</span>
              </div>

              <div className={styles.stepNav}>
                <button className="btn btn--outline" onClick={() => setStep(1)}>
                  Back
                </button>
                <button className={`btn btn--gold`} onClick={() => setStep(3)}>
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className={styles.formSection}>
              <h2 className={`serif ${styles.formTitle}`}>Review &amp; Confirm</h2>

              {/* Delivery summary */}
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
                <button className="btn btn--outline" onClick={() => setStep(2)}>
                  Back
                </button>
                <button
                  className={`btn btn--gold`}
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
            <span>{shippingCost === 0 ? 'Free' : formatINR(shippingCost)}</span>
          </div>
          <hr className="hairline-rule" />
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>Total</span>
            <span className="price">{formatINR(grandTotal)}</span>
          </div>

          {/* Assurances */}
          <div className={styles.assurances}>
            {['Free shipping above ₹5,000', 'Easy 15-day returns', 'Secure checkout'].map((a) => (
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

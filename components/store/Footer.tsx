import React from 'react';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import SiteConfigModel from '@/lib/models/SiteConfig';
import WhatsAppButton from './WhatsAppButton';
import styles from './Footer.module.css';

const SHOP_LINKS = [
  { label: 'Ilkal Silk',      href: '/collections/ilkal-silk' },
  { label: 'Paithani Silk',   href: '/collections/paithani-silk' },
  { label: 'Gadwal Silk',     href: '/collections/gadwal-silk' },
  { label: 'Mix Silk',        href: '/collections/mix-silk' },
  { label: 'All Collections', href: '/collections' },
];

const HOUSE_LINKS = [
  { label: 'Our Story',      href: '/heritage' },
  { label: 'The Weavers',    href: '/heritage/weavers' },
  { label: 'Lookbook',       href: '/lookbook' },
  { label: 'Sustainability', href: '/heritage/sustainability' },
  { label: 'Blog',           href: '/journal' },
];

const CARE_LINKS = [
  { label: 'Care Instructions',  href: '/care' },
  { label: 'Shipping Policy',    href: '/shipping' },
  { label: 'Returns & Exchange', href: '/returns' },
  { label: 'Privacy Policy',     href: '/privacy' },
  { label: 'Terms of Use',       href: '/terms' },
];

const DEFAULT_TRUST = [
  'Free shipping above ₹5,000',
  'Easy 15-day returns',
  'Secure payment',
  '100% authentic handloom',
];

async function getTrustItems(): Promise<string[]> {
  try {
    await connectDB();
    const cfg = await SiteConfigModel.findOne({}).lean();
    return (cfg?.trustItems as string[] | undefined) ?? DEFAULT_TRUST;
  } catch {
    return DEFAULT_TRUST;
  }
}

export default async function Footer() {
  const trustItems = await getTrustItems();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>

          {/* Column 1: Brand */}
          <div className={styles.brand}>
            <div className={`serif ${styles.logo}`}>VC</div>
            <p className={styles.tagline}>
              Woven in gold.<br />Worn through generations.
            </p>
            <WhatsAppButton />
          </div>

          {/* Column 2: Shop */}
          <div className={styles.col}>
            <h4 className={`eyebrow ${styles.colHead}`}>Shop</h4>
            <ul className={styles.colLinks}>
              {SHOP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={styles.footerLink}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: The House */}
          <div className={styles.col}>
            <h4 className={`eyebrow ${styles.colHead}`}>The House</h4>
            <ul className={styles.colLinks}>
              {HOUSE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={styles.footerLink}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Care */}
          <div className={styles.col}>
            <h4 className={`eyebrow ${styles.colHead}`}>Care & Policies</h4>
            <ul className={styles.colLinks}>
              {CARE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={styles.footerLink}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="hairline-rule" />

        {/* Assurance strip */}
        <div className={styles.assurance}>
          {trustItems.map((text, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className={styles.dot} aria-hidden="true">·</span>}
              <span>{text}</span>
            </React.Fragment>
          ))}
        </div>

        <div className={styles.copy}>
          <p className="caption">© {new Date().getFullYear()} VC Sarees. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link';
import styles from './Footer.module.css';

const SHOP_LINKS = [
  { label: 'Ilkal Silk',          href: '/collections/ilkal-silk' },
  { label: 'Paithani Silk',       href: '/collections/paithani-silk' },
  { label: 'Gadwal Silk',         href: '/collections/gadwal-silk' },
  { label: 'Mix Silk',            href: '/collections/mix-silk' },
  { label: 'All Collections',     href: '/collections' },
];

const HOUSE_LINKS = [
  { label: 'Our Story',   href: '/heritage' },
  { label: 'The Weavers', href: '/heritage/weavers' },
  { label: 'Lookbook',    href: '/lookbook' },
  { label: 'Sustainability', href: '/heritage/sustainability' },
  { label: 'Blog',        href: '/journal' },
];

const CARE_LINKS = [
  { label: 'Care Instructions', href: '/care' },
  { label: 'Shipping Policy',   href: '/shipping' },
  { label: 'Returns & Exchange',href: '/returns' },
  { label: 'Privacy Policy',    href: '/privacy' },
  { label: 'Terms of Use',      href: '/terms' },
];

export default function Footer() {
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
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn--whatsapp ${styles.waBtn}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp us
            </a>
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
          <span>Free shipping above ₹5,000</span>
          <span className={styles.dot} aria-hidden="true">·</span>
          <span>Easy 15-day return</span>
          <span className={styles.dot} aria-hidden="true">·</span>
          <span>Secure payment</span>
          <span className={styles.dot} aria-hidden="true">·</span>
          <span>UPI · Card · COD</span>
        </div>

        <div className={styles.copy}>
          <p className="caption">© {new Date().getFullYear()} VC Sarees. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

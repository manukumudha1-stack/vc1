'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './AdminSidebar.module.css';

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      </svg>
    ),
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4l6-3 6 3v8l-6 3-6-3V4z" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <path d="M8 1v14M2 4l6 3 6-3" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    label: 'Collections',
    href: '/admin/collections',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 3h14M1 8h14M1 13h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="3" cy="3" r="1" fill="currentColor"/>
        <circle cx="3" cy="8" r="1" fill="currentColor"/>
        <circle cx="3" cy="13" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: 'Inventory',
    href: '/admin/inventory',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="4" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <path d="M5 4V3a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 9h6M8 7v4" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="1" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    label: 'Customers',
    href: '/admin/customers',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      </svg>
    ),
  },
  {
    label: 'Discounts',
    href: '/admin/discounts',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M5 11L11 5" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <circle cx="11" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <path d="M2 8h.01M14 8h.01M8 2v.01M8 14v.01" stroke="currentColor" strokeWidth="1.4"/>
        <rect x="1" y="1" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      </svg>
    ),
  },
  {
    label: 'Reports',
    href: '/admin/reports',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 13L5 9l3 2 3-5 3 2" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        <path d="M1 13h14" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  }

  const email = (session?.user as { email?: string })?.email ?? '';
  const initial = email.charAt(0).toUpperCase();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          V<span className={styles.logoAccent}>C</span>
        </div>
        <div className={styles.logoTag}>Atelier Admin</div>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navSection}>Menu</div>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem}${isActive(item) ? ' ' + styles.active : ''}`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.user}>
        <div className={styles.userInner}>
          <div className={styles.avatar}>{initial}</div>
          <div>
            <div className={styles.userEmail}>{email}</div>
            <div className={styles.userRole}>Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

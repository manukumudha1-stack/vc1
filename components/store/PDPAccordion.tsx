'use client';

import { useState } from 'react';
import styles from './PDPAccordion.module.css';

interface AccordionItem {
  title: string;
  content: string;
}

export default function PDPAccordion({ items }: { items: AccordionItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className={styles.accordion}>
      {items.map((item, i) => (
        <div key={item.title} className={styles.item}>
          <button
            className={styles.trigger}
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            aria-expanded={openIdx === i}
          >
            <span className={styles.triggerLabel}>{item.title}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={openIdx === i ? styles.chevronOpen : styles.chevron}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {openIdx === i && (
            <div className={styles.panel}>
              <p className={styles.panelText}>{item.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

import styles from './MetricCard.module.css';

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  dotColor?: string;
}

export default function MetricCard({ label, value, delta, deltaUp, dotColor }: MetricCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.labelRow}>
        {dotColor && <span className={styles.dot} style={{ background: dotColor }} />}
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.value}>{value}</div>
      {delta && (
        <span className={`${styles.delta} ${deltaUp ? styles.up : styles.down}`}>
          {deltaUp ? '↑' : '↓'} {delta}
        </span>
      )}
    </div>
  );
}

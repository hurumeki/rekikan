import styles from './EraBadge.module.css';

export default function EraBadge({ color }: { color: string }) {
  return <div className={styles.badge} style={{ backgroundColor: color }} aria-hidden="true" />;
}

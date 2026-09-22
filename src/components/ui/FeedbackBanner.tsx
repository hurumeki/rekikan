import type { ReactNode } from 'react';
import styles from './FeedbackBanner.module.css';

interface FeedbackBannerProps {
  correct: boolean;
  children: ReactNode;
}

/** 1 問ごとに正誤を伝える帯（時代帯当て・タイムライン）。 */
export default function FeedbackBanner({ correct, children }: FeedbackBannerProps) {
  return (
    <div className={`${styles.feedback} ${correct ? styles.correct : styles.wrong}`} role="status">
      {children}
    </div>
  );
}

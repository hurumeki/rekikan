import type { ButtonHTMLAttributes } from 'react';
import styles from './ActionButton.module.css';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

/** 画面下部に置く主要操作のボタン（確定・次へ・もう一度 など）。 */
export default function ActionButton({
  variant = 'primary',
  className,
  ...props
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}

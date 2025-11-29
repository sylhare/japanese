import Link from '@docusaurus/Link';
import React, {type ReactNode} from 'react';
import styles from './styles.module.css';

export interface ReferenceCardProps {
  emoji: string;
  title: string;
  description: string;
  href: string;
  linkText: string;
}

export function ReferenceCard({
  emoji,
  title,
  description,
  href,
  linkText,
}: ReferenceCardProps): ReactNode {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>
        {emoji} {title}
      </h3>
      <p className={styles.cardDescription}>{description}</p>
      <Link to={href} className={styles.cardLink}>
        {linkText} →
      </Link>
    </div>
  );
}

export interface ReferenceCardGridProps {
  children: ReactNode;
}

export default function ReferenceCardGrid({
  children,
}: ReferenceCardGridProps): ReactNode {
  return <div className={styles.cardGrid}>{children}</div>;
}


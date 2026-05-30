import Link from '@docusaurus/Link';
import React, {type ReactNode} from 'react';
import styles from './styles.module.css';

export interface LessonItem {
  title: string;
  description: string;
  to: string;
}

interface LessonListProps {
  items: LessonItem[];
}

function parseBold(text: string): ReactNode[] {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

function LessonCard({title, description, to}: LessonItem) {
  return (
    <Link to={to} className={styles.lessonCard}>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{parseBold(description)}</p>
      </div>
      <div className={styles.cardArrow}>→</div>
    </Link>
  );
}

export default function LessonList({items}: LessonListProps): ReactNode {
  return (
    <div className={styles.lessonGrid}>
      {items.map((item, idx) => (
        <LessonCard key={idx} {...item} />
      ))}
    </div>
  );
}


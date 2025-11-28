import Link from '@docusaurus/Link';
import React, {type ReactNode} from 'react';
import styles from './styles.module.css';

export interface NextStepItem {
  title: string;
  description: string;
  to: string;
}

interface NextStepsProps {
  items: NextStepItem[];
}

function NextStepCard({title, description, to}: NextStepItem) {
  return (
    <Link to={to} className={styles.nextStepCard}>
      <div className={styles.cardContent}>
        <h4 className={styles.cardTitle}>{title}</h4>
        <p className={styles.cardDescription}>{description}</p>
      </div>
      <div className={styles.cardArrow}>→</div>
    </Link>
  );
}

export default function NextSteps({items}: NextStepsProps): ReactNode {
  return (
    <div className={styles.nextStepsContainer}>
      <h2 className={styles.sectionTitle}>Next Steps</h2>
      <p className={styles.sectionSubtitle}>
        Once you're comfortable with this lesson, check out:
      </p>
      <div className={styles.nextStepsGrid}>
        {items.map((item, idx) => (
          <NextStepCard key={idx} {...item} />
        ))}
      </div>
    </div>
  );
}


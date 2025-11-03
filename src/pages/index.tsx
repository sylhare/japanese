import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const mainFeatures = [
  {
    title: 'Lessons',
    icon: '📚',
    description: 'Structured learning path',
    link: '/docs/lessons/intro',
    color: 'primary'
  },
  {
    title: 'Grammar',
    icon: '📘',
    description: 'Grammar rules & structure',
    link: '/docs/lessons/grammar',
    color: 'info'
  },
  {
    title: 'Vocabulary',
    icon: '📝',
    description: 'Word lists & practice',
    link: '/docs/lessons/vocabulary',
    color: 'success'
  },
  {
    title: 'References',
    icon: '📖',
    description: 'Quick lookup tools',
    link: '/docs/reference/hiragana-chart',
    color: 'secondary'
  }
];

function FeatureCard({title, icon, description, link, color}: typeof mainFeatures[0]) {
  return (
    <Link to={link} className={styles.featureCard}>
      <div className={styles.cardIcon}>{icon}</div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>
      </div>
      <div className={styles.cardArrow}>→</div>
    </Link>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <div className={styles.heroContent}>
          <Heading as="h1" className={styles.heroTitle}>
            {siteConfig.title}
          </Heading>
          <p className={styles.heroSubtitle}>Choose your learning path</p>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Learn Japanese`}
      description="Comprehensive Japanese learning platform with structured lessons, vocabulary, and grammar references">
      <HomepageHeader />
      <main className={styles.mainContent}>
        <div className="container">
          <div className={styles.featuresGrid}>
            {mainFeatures.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}

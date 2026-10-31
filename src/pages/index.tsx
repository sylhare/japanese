import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import type {ReactNode} from 'react';
import styles from './index.module.css';

function IconLessons() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm-1 14c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v12z" />
    </svg>
  );
}

function IconDictionary() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

function IconStudy() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" />
    </svg>
  );
}

function IconReference() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" />
    </svg>
  );
}

const mainFeatures = [
  {
    title: 'Lessons',
    Icon: IconLessons,
    description: 'Structured lessons & guides',
    link: '/docs/intro',
  },
  {
    title: 'Dictionary',
    Icon: IconDictionary,
    description: 'Search words & JLPT levels',
    link: '/dictionary',
  },
  {
    title: 'Study',
    Icon: IconStudy,
    description: 'Practice flashcards & kanji',
    link: '/study',
  },
  {
    title: 'Reference',
    Icon: IconReference,
    description: 'Kana charts & cheat sheets',
    link: '/docs/reference',
  },
];

function FeatureCard({title, Icon, description, link}: typeof mainFeatures[0]) {
  return (
    <Link to={link} className={styles.featureCard}>
      <div className={styles.cardIcon}><Icon /></div>
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
          <div className={styles.buttonContainer}>
            <Link
              className={styles.getStartedButton}
              to="/docs/intro">
              Get Started - はじめましょう <span className={styles.arrow}>→</span>
            </Link>
          </div>
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

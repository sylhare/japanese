import Heading from '@theme/Heading';
import clsx from 'clsx';
import React from 'react';
import type {ReactNode} from 'react';
import MountainSvg from '@site/static/img/undraw_docusaurus_mountain.svg';
import TreeSvg from '@site/static/img/undraw_docusaurus_tree.svg';
import ReactSvg from '@site/static/img/undraw_docusaurus_react.svg';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Structured Lessons',
    Svg: MountainSvg,
    description: (
      <>
        Learn Japanese step-by-step with organized lessons covering hiragana, katakana,
        grammar, and vocabulary. Each lesson builds upon the previous one.
      </>
    ),
  },
  {
    title: 'Interactive Vocabulary',
    Svg: TreeSvg,
    description: (
      <>
        Search and explore Japanese vocabulary with our comprehensive database.
        Filter by category, search by meaning, and practice with hiragana, katakana, and kanji.
      </>
    ),
  },
  {
    title: 'Quick Reference',
    Svg: ReactSvg,
    description: (
      <>
        Access kana charts, conjugation tables, and grammar references instantly.
        Perfect for quick lookups while studying or practicing.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

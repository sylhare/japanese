import React from 'react';

interface HeadingProps {
  as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

/** Mock Heading component for testing */
export default function Heading({ as: Tag, children, className, ...props }: HeadingProps) {
  return (
    <Tag className={className} {...props}>
      {children}
    </Tag>
  );
}

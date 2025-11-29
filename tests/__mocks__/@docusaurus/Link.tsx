import React from 'react';

interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

/** Mock Link component for testing */
export default function Link({ to, children, className }: LinkProps) {
  return (
    <a href={to} className={className}>
      {children}
    </a>
  );
}


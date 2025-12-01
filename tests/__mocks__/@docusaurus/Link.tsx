import React, { type ReactNode } from 'react';

interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  [key: string]: any;
}

/** Mock Link component for testing */
export default function Link({ to, children, className, ...props }: LinkProps): ReactNode {
  return (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  );
}

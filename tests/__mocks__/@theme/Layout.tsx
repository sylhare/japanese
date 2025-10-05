import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

/** Mock Layout component for testing */
export default function Layout({ children, title, description }: LayoutProps) {
  return (
    <div data-testid="layout">
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </div>
  );
}

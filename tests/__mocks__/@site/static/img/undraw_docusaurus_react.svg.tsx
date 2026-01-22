import React from 'react';

interface SvgProps {
  className?: string;
  role?: string;
  [key: string]: any;
}

/** Mock SVG component for testing */
export default function MockReactSvg({ className, role, ...props }: SvgProps) {
  return <svg className={className} role={role} data-testid="react-svg" {...props} />;
}

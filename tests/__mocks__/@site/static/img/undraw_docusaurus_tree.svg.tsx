import React from 'react';

interface SvgProps {
  className?: string;
  role?: string;
  [key: string]: any;
}

/** Mock SVG component for testing */
export default function MockTreeSvg({ className, role, ...props }: SvgProps) {
  return <svg className={className} role={role} data-testid="tree-svg" {...props} />;
}

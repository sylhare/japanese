import React from 'react';

interface SvgProps {
  className?: string;
  role?: string;
  [key: string]: any;
}

/** Mock SVG component for testing */
export default function MockMountainSvg({ className, role, ...props }: SvgProps) {
  return <svg className={className} role={role} data-testid="mountain-svg" {...props} />;
}

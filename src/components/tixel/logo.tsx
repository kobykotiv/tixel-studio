import type { SVGProps } from 'react';

export function TixelLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M3 3h18v4H3z" />
      <path d="M10 7h4v14h-4z" />
    </svg>
  );
}

import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
      <path d="M12 22V2" />
      <path d="M12 22a4.5 4.5 0 0 0 4.5-4.5v-11A4.5 4.5 0 0 0 12 2a4.5 4.5 0 0 0-4.5 4.5v11A4.5 4.5 0 0 0 12 22Z" />
    </svg>
  );
}

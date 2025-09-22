import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 2v8" />
      <path d="M12 2v8" />
      <path d="M16 2v8" />
      <path d="M18 10V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v5" />
      <path d="M6 10v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-9" />
      <path d="M10 16h4" />
    </svg>
  ),
};

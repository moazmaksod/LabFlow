import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
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
      <title>LabFlow Logo</title>
      <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5h-5C5.6 22 4.5 20.9 4.5 19.5V2" />
      <path d="M14.5 2H18a2 2 0 0 1 2 2v2" />
      <path d="M5 12H2" />
      <path d="M9.5 12H19" />
      <path d="M5 7H2" />
      <path d="M9.5 7H19" />
    </svg>
  ),
};

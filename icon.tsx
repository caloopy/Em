import { NextResponse } from 'next/server';

export async function GET() {
  const svg = `
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 21V14.978C8 13.355 8.95801 11.962 10.383 11.269L14 9L10.383 6.73102C8.95801 6.03702 8 4.64503 8 3.02203V2L18 8.5V15.5L8 21Z" />
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

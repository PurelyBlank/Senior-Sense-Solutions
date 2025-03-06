// ./app/head.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Senior Sense Solutions',
  description: 'Secure website for storing patient health information.',
};

export default function Head() {
  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </>
  );
}
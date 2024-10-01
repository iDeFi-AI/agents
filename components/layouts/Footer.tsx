import React from 'react';
import Link from 'next/link';

export const Footer: React.FC<FooterProps> = ({}) => {
  return (
    <footer id='App:Footer' className={('mx-auto max-w-7xl px-2 sm:px-4 lg:px-8')}>
      <div className="flex justify-between">
        <p>&copy; {new Date().getFullYear().toString()} iDeFi.ai</p>
        <p>
         <Link 
            href="/terms"
            className="text-purple-450 underline hover:underline">Disclosure of Terms
          </Link>{' '}
        </p>
      </div>
    </footer>
  );
};

interface FooterProps {}

export default Footer;

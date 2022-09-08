import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import logo from '../../public/img/logo-horizontal.png';
// Components
import Connect from './Connect';

export default function MenuTop() {
  const [styleBg, setStyleBg] = useState(false);
  const pixelsToScrollBeforeStyleBg = 64;

  useEffect(() => {
    window.addEventListener('scroll', function() {
      scrollY > pixelsToScrollBeforeStyleBg 
      ? setStyleBg(true) 
      : setStyleBg(false)
    });
  }, [])

  return (
    <div className={`sticky top-0 ${styleBg ? 'bg-gradient-to-r from-brand-2 to-brand-1 shadow-xl z-50' : ''}`}>
      <div className='navbar max-w-3xl mx-auto'>
        <div className="flex-1">
          <Link href="/">
            <Image
              src={logo}
              alt="Logo"
              width={410}
              height={60}
              priority
            />
          </Link>
        </div>
        <div className="flex-none">
          <Connect />
        </div>
      </div>
    </div>
  );
}
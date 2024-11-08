'use client'

import React, { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="bg-white text-black p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:text-gray-600 transition-colors">
          DanielToken
        </Link>
        
        <nav className="flex-grow">
          <ul className="flex justify-center space-x-8">
            <li><Link href="/my-tokens" className="hover:text-gray-600 transition-colors">My Tokens</Link></li>
            <li><Link href="/collections" className="hover:text-gray-600 transition-colors">Collections</Link></li>
            <li className="relative">
              <button
                onClick={toggleDropdown}
                className="hover:text-gray-600 transition-colors focus:outline-none"
              >
                Create New
              </button>
              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-200">
                  <Link 
                    href="/create/nft" 
                    className="block px-4 py-2 hover:bg-gray-100 rounded-t-lg"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    NFT
                  </Link>
                  <Link 
                    href="/create/fungible" 
                    className="block px-4 py-2 hover:bg-gray-100 rounded-b-lg"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Fungible Token
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </nav>

        <div>
          <WalletMultiButton className="bg-black text-white hover:bg-gray-800 transition-colors" />
        </div>
      </div>
    </header>
  );
};

export default Header;

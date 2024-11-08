import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">DanielToken</h3>
          <p className="text-gray-400">Empowering the future of digital assets on the Solana blockchain.</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link href="/about" className="hover:text-green-400 transition-colors">About Us</Link></li>
            <li><Link href="/faq" className="hover:text-green-400 transition-colors">FAQ</Link></li>
            <li><Link href="/terms" className="hover:text-green-400 transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-green-400 transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
          <div className="flex space-x-4">
            <a href="#" className="text-2xl hover:text-green-400 transition-colors">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-2xl hover:text-green-400 transition-colors">
              <i className="fab fa-discord"></i>
            </a>
            <a href="#" className="text-2xl hover:text-green-400 transition-colors">
              <i className="fab fa-github"></i>
            </a>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
        <p>&copy; 2024 DanielToken. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;


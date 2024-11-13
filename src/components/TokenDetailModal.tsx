import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface TokenDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: {
    name: string;
    image?: string;
    description?: string;
    symbol?: string;
  };
}

export function TokenDetailModal({ isOpen, onClose, token }: TokenDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{token.name}</h3>
          {token.symbol && (
            <span className="text-sm text-gray-500">
              Symbol: {token.symbol}
            </span>
          )}
        </div>

        {token.image && (
          <div className="mb-4 w-full h-64 overflow-hidden">
            <Image
              src={token.image}
              alt={token.name}
              width={256}
              height={256}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {token.description ? (
          <p className="text-gray-600 dark:text-gray-300">
            {token.description}
          </p>
        ) : (
          <p className="text-gray-500 italic">
            No description available
          </p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 
import { useState } from 'react';

interface BurnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBurn: (amount: number) => void;
  maxAmount: number;
  tokenName: string;
}

export function BurnModal({ isOpen, onClose, onBurn, maxAmount, tokenName }: BurnModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = () => {
    const burnAmount = Number(amount);
    if (isNaN(burnAmount) || burnAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (burnAmount > maxAmount) {
      setError(`Amount cannot exceed ${maxAmount}`);
      return;
    }
    onBurn(burnAmount);
    setAmount('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Burn {tokenName}</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Amount to burn</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
            max={maxAmount}
            className="w-full p-2 border rounded"
            placeholder={`Max: ${maxAmount}`}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Burn
          </button>
        </div>
      </div>
    </div>
  );
} 
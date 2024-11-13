import React, { useState } from 'react';

interface DelegateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelegate: (delegateAddress: string, amount: number) => void;
  maxAmount: number;
  tokenSymbol?: string;
  isLoading?: boolean;
}

export function DelegateModal({ 
  isOpen, 
  onClose, 
  onDelegate, 
  maxAmount, 
  tokenSymbol,
  isLoading = false 
}: DelegateModalProps) {
  const [delegateAddress, setDelegateAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const delegateAmount = Number(amount);
    if (!delegateAddress) {
      setError('Please enter delegate address');
      return;
    }
    if (isNaN(delegateAmount) || delegateAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (delegateAmount > maxAmount) {
      setError(`Amount cannot exceed ${maxAmount}`);
      return;
    }

    onDelegate(delegateAddress, delegateAmount);
    setDelegateAddress('');
    setAmount('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Delegate {tokenSymbol}</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Delegate Address</label>
          <input
            type="text"
            value={delegateAddress}
            onChange={(e) => {
              setDelegateAddress(e.target.value);
              setError('');
            }}
            className="w-full p-2 border rounded"
            placeholder="Enter delegate wallet address"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Amount to delegate</label>
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
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Delegate
          </button>
        </div>
      </div>
    </div>
  );
} 
import React, { useState } from 'react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (toAddress: string, amount?: number) => void;
  maxAmount: number;
  tokenSymbol?: string;
  isLoading?: boolean;
  isNFT?: boolean;
}

export function TransferModal({
  isOpen,
  onClose,
  onTransfer,
  maxAmount,
  tokenSymbol,
  isLoading = false,
  isNFT = false,
}: TransferModalProps) {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    console.log('Transfer Modal Submit:', {
      toAddress,
      amount,
      maxAmount,
      isNFT
    });

    if (!toAddress) {
      setError('Please enter recipient address');
      return;
    }

    if (!isNFT) {
      const transferAmount = parseFloat(amount);
      console.log('Transfer Amount Validation:', {
        raw: amount,
        parsed: transferAmount,
        isNaN: isNaN(transferAmount),
        maxAmount
      });

      if (isNaN(transferAmount) || transferAmount <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      if (transferAmount > maxAmount) {
        setError(`Amount cannot exceed ${maxAmount}`);
        return;
      }
      onTransfer(toAddress, transferAmount);
    } else {
      onTransfer(toAddress);
    }
    setToAddress('');
    setAmount('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Transfer {tokenSymbol}</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Recipient Address</label>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => {
              setToAddress(e.target.value);
              setError('');
            }}
            className="w-full p-2 border rounded"
            placeholder="Enter recipient wallet address"
          />
        </div>
        {!isNFT && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Amount to transfer</label>
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
          </div>
        )}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isLoading ? 'Processing...' : 'Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
} 
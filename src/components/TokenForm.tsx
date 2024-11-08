import { ChangeEvent } from 'react';

interface TokenFormProps {
  tokenName: string;
  tokenSymbol: string;
  tokenDescription: string;
  tokenDecimals: number;
  tokenAmount: number;
  onNameChange: (value: string) => void;
  onSymbolChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDecimalsChange: (value: number) => void;
  onAmountChange: (value: number) => void;
  onImageChange: (file: File) => void;
  errors?: Record<string, string>;
  isLoading?: boolean;
}

export function TokenForm({
  tokenName,
  tokenSymbol,
  tokenDescription,
  tokenDecimals,
  tokenAmount,
  onNameChange,
  onSymbolChange,
  onDescriptionChange,
  onDecimalsChange,
  onAmountChange,
  onImageChange,
  errors,
  isLoading
}: TokenFormProps) {
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageChange(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <input 
          type="text"
          placeholder="Token Name"
          value={tokenName}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors?.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <input 
          type="text"
          placeholder="Token Symbol"
          value={tokenSymbol}
          onChange={(e) => onSymbolChange(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors?.symbol && (
          <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>
        )}
      </div>

      <div>
        <textarea 
          placeholder="Token Description"
          value={tokenDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div>
        <input 
          type="number"
          placeholder="Decimals"
          value={tokenDecimals}
          onChange={(e) => onDecimalsChange(Number(e.target.value))}
          disabled={isLoading}
          min={0}
          max={9}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">Number of decimal places (0-9)</p>
        {errors?.decimals && (
          <p className="text-red-500 text-sm">{errors.decimals}</p>
        )}
      </div>

      <div>
        <input 
          type="number"
          placeholder="Initial Amount"
          value={tokenAmount}
          onChange={(e) => onAmountChange(Number(e.target.value))}
          disabled={isLoading}
          min={1}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">Initial supply of tokens to mint</p>
        {errors?.amount && (
          <p className="text-red-500 text-sm">{errors.amount}</p>
        )}
      </div>

      <div>
        <input 
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={isLoading}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">Token image (required)</p>
        {errors?.image && (
          <p className="text-red-500 text-sm">{errors.image}</p>
        )}
      </div>
    </div>
  );
}
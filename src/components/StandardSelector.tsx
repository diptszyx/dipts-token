interface StandardSelectorProps {
  selectedStandard: 'original' | 'token2022';
  onSelectStandard: (standard: 'original' | 'token2022') => void;
  disabled?: boolean;
}

export function StandardSelector({ 
  selectedStandard, 
  onSelectStandard,
  disabled 
}: StandardSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">Select Token Standard</label>
      <div className="flex gap-4">
        <button
          onClick={() => onSelectStandard('original')}
          disabled={disabled}
          className={`flex-1 p-3 rounded-lg border ${
            selectedStandard === 'original' 
              ? 'bg-blue-50 border-blue-500' 
              : 'border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Original Token
        </button>
        <button
          onClick={() => onSelectStandard('token2022')}
          disabled={disabled}
          className={`flex-1 p-3 rounded-lg border ${
            selectedStandard === 'token2022' 
              ? 'bg-blue-50 border-blue-500' 
              : 'border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Token-2022
        </button>
      </div>
    </div>
  );
}
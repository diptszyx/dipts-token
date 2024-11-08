export interface TokenFormData {
  name: string;
  symbol: string;
  description: string;
  decimals: number;
  amount: number;
  image: File | null;
}

export function validateTokenForm(data: TokenFormData) {
  const errors: Partial<Record<keyof TokenFormData, string>> = {};

  if (!data.name) errors.name = 'Token name is required';
  if (!data.symbol) errors.symbol = 'Token symbol is required';
  if (data.decimals < 0 || data.decimals > 9) {
    errors.decimals = 'Decimals must be between 0 and 9';
  }
  if (data.amount <= 0) errors.amount = 'Amount must be positive';
  if (!data.image) errors.image = 'Token image is required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
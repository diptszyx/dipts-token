'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { useUploadToIPFS } from '@/hooks/useUploadtoIPFS';
import { validateTokenForm } from '@/utils/validation';
import { createOriginalToken, createToken2022 } from '@/utils/tokenCreation';
import { StandardSelector } from '@/components/StandardSelector';
import { TokenForm } from '@/components/TokenForm';
import { Token2022Options } from '@/components/Token2022Options';
import { mplToolbox } from '@metaplex-foundation/mpl-toolbox';
import { toast } from 'react-toastify';

// Tách logic xử lý token creation ra thành custom hook
function useTokenCreation() {
  const wallet = useWallet();
  const { uploadToIPFS } = useUploadToIPFS();

  const createToken = async (params: {
    standard: 'original' | 'token2022';
    metadata: any; // Assuming TokenMetadata and Token2022Metadata are not defined in the current context
    image: File;
  }) => {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const umi = createUmi('https://api.devnet.solana.com')
      .use(mplTokenMetadata())
      .use(mplToolbox())
      .use(walletAdapterIdentity(wallet));

    const uploadResult = await uploadToIPFS(params.image, {
      name: params.metadata.name,
      symbol: params.metadata.symbol,
      description: params.metadata.description
    });

    if (!uploadResult) {
      throw new Error('Failed to upload to IPFS');
    }

    const tokenMetadata = {
      ...params.metadata,
      uri: uploadResult.metadataUri
    };

    return params.standard === 'original'
      ? await createOriginalToken(umi, tokenMetadata)
      : await createToken2022(umi, tokenMetadata);
  };

  return { createToken };
}

export default function CreateFungibleTokenPage() {
  const wallet = useWallet();
  const [selectedStandard, setSelectedStandard] = useState<'original' | 'token2022'>('original');
  const [status, setStatus] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Token Basic Info
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState(9);
  const [tokenAmount, setTokenAmount] = useState(1000000000);
  const [tokenImage, setTokenImage] = useState<File | null>(null);

  // Token-2022 Features
  const [transferFeeEnabled, setTransferFeeEnabled] = useState(false);
  const [transferFeeBasisPoints, setTransferFeeBasisPoints] = useState(0);
  const [transferFeeReceiver, setTransferFeeReceiver] = useState('');
  const [nonTransferable, setNonTransferable] = useState(false);
  const [requireMemo, setRequireMemo] = useState(false);

  const { createToken } = useTokenCreation();

  const clearForm = () => {
    setTokenName('');
    setTokenSymbol('');
    setTokenDescription('');
    setTokenImage(null);
    setTokenDecimals(0);
    setTokenAmount(0);
    // Nếu bạn có input file, clear nó
    if (document.getElementById('imageInput')) {
      (document.getElementById('imageInput') as HTMLInputElement).value = '';
    }
  };

  const handleCreateToken = async () => {
    if (!wallet.publicKey || !tokenImage) {
      return;
    }

    setIsLoading(true);
    setFormErrors({});
    setStatus('');

    try {
      const validation = validateTokenForm({
        name: tokenName,
        symbol: tokenSymbol,
        description: tokenDescription,
        decimals: tokenDecimals,
        amount: tokenAmount,
        image: tokenImage
      });

      if (!validation.isValid) {
        setFormErrors(validation.errors);
        return;
      }

      const metadata = {
        name: tokenName,
        symbol: tokenSymbol,
        description: tokenDescription,
        decimals: tokenDecimals,
        amount: tokenAmount,
        ...(selectedStandard === 'token2022' && {
          transferFeeEnabled,
          transferFeeBasisPoints,
          transferFeeReceiver,
          nonTransferable,
          requireMemo
        })
      };

      await createToken({
        standard: selectedStandard,
        metadata,
        image: tokenImage
      });

      toast.success('Token created successfully! 🎉');
      clearForm();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to create token');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold text-center mb-6">Create Fungible Token</h1>

      <StandardSelector 
        selectedStandard={selectedStandard}
        onSelectStandard={setSelectedStandard}
        disabled={isLoading}
      />

      <TokenForm 
        tokenName={tokenName}
        tokenSymbol={tokenSymbol}
        tokenDescription={tokenDescription}
        tokenDecimals={tokenDecimals}
        tokenAmount={tokenAmount}
        onNameChange={setTokenName}
        onSymbolChange={setTokenSymbol}
        onDescriptionChange={setTokenDescription}
        onDecimalsChange={setTokenDecimals}
        onAmountChange={setTokenAmount}
        onImageChange={setTokenImage}
        errors={formErrors}
        isLoading={isLoading}
      />

      {selectedStandard === 'token2022' && (
        <Token2022Options 
          transferFeeEnabled={transferFeeEnabled}
          transferFeeBasisPoints={transferFeeBasisPoints}
          transferFeeReceiver={transferFeeReceiver}
          nonTransferable={nonTransferable}
          requireMemo={requireMemo}
          onTransferFeeEnabledChange={setTransferFeeEnabled}
          onTransferFeeBasisPointsChange={setTransferFeeBasisPoints}
          onTransferFeeReceiverChange={setTransferFeeReceiver}
          onNonTransferableChange={setNonTransferable}
          onRequireMemoChange={setRequireMemo}
        />
      )}

      <button 
        onClick={handleCreateToken}
        disabled={isLoading || !wallet.publicKey}
        className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Creating Token...' : 'Create Token'}
      </button>

      {status && (
        <p className="mt-4 text-center text-sm">
          {status}
        </p>
      )}
    </div>
  );
}
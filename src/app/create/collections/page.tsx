'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { 
  createCollection,
  mplCore,
} from '@metaplex-foundation/mpl-core';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { generateSigner } from '@metaplex-foundation/umi';
import { useUploadToIPFS } from '@/hooks/useUploadtoIPFS';
import { toast } from 'react-toastify';

export default function CreateCollectionPage() {
  const wallet = useWallet();
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState<string>('');

  // Collection Info
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [royaltyBasisPoints, setRoyaltyBasisPoints] = useState(500); // 5%

  const { uploadToIPFS } = useUploadToIPFS();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleCreateCollection = async () => {
    if (!wallet.publicKey || !image) {
      toast.error('Please connect wallet and upload an image', {
        autoClose: 1000
      });
      return;
    }

    setIsCreating(true);
    try {
      // 1. Upload metadata to IPFS
      const uploadResult = await uploadToIPFS(image, {
        name,
        symbol,
        description,
      });

      if (!uploadResult) throw new Error('Failed to upload to IPFS');

      // 2. Create Umi instance
      const umi = createUmi('https://api.devnet.solana.com')
        .use(mplCore())
        .use(walletAdapterIdentity(wallet));

      // 3. Create Collection - simple version
      const collectionSigner = generateSigner(umi);
      
      await createCollection(umi, {
        collection: collectionSigner,
        name,
        uri: uploadResult.metadataUri,
      }).sendAndConfirm(umi);

      setStatus('Collection created successfully!');
      toast.success('Created Collection! 🎉', {
        autoClose: 1000
      });

      return collectionSigner.publicKey;

    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create collection';
      
      console.error('Error:', error);
      toast.error(errorMessage, {
        autoClose: 1000
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Create Collection</h1>

      <div className="space-y-6">
        {/* Collection Details */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Collection Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Collection Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Collection Symbol"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Collection Description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded"
              />
            </div>

    
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreateCollection}
          disabled={isCreating || !wallet.publicKey}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreating ? 'Creating Collection...' : 'Create Collection'}
        </button>

        {/* Status Message */}
        {status && (
          <p className="mt-4 text-center text-sm">{status}</p>
        )}
      </div>
    </div>
  );
}

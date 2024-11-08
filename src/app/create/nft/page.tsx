'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { 
  mplTokenMetadata, 
  createNft,
  createV1, 
  mintV1 as mintV1Metadata,
  TokenStandard 
} from '@metaplex-foundation/mpl-token-metadata';
import { mplCore } from '@metaplex-foundation/mpl-core';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { 
  generateSigner,
  percentAmount,
  publicKey,
  none,
  transactionBuilderGroup
} from '@metaplex-foundation/umi';
import { findAssociatedTokenPda } from '@metaplex-foundation/mpl-toolbox';
import { useUploadToIPFS } from '@/hooks/useUploadtoIPFS';
import { 
  create
} from '@metaplex-foundation/mpl-core';
import { createTree, mintV1 as mintV1Compressed, mplBubblegum } from '@metaplex-foundation/mpl-bubblegum';
import { toast } from 'react-toastify';


const SPL_TOKEN_2022_PROGRAM_ID = publicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

// Định nghĩa các cấu hình hợp lệ cho Merkle tree
const VALID_TREE_CONFIGS = [
  { maxDepth: 14, maxBufferSize: 64 },
  { maxDepth: 14, maxBufferSize: 256 },
  { maxDepth: 14, maxBufferSize: 1024 },
  { maxDepth: 20, maxBufferSize: 64 },
  { maxDepth: 20, maxBufferSize: 256 },
  { maxDepth: 20, maxBufferSize: 1024 },
  { maxDepth: 30, maxBufferSize: 64 },
  { maxDepth: 30, maxBufferSize: 256 },
  { maxDepth: 30, maxBufferSize: 1024 },
] as const;

export default function CreateNFTPage() {
  const wallet = useWallet();
  const [selectedStandard, setSelectedStandard] = useState<'original' | 'token2022'>('original');
  const [selectedProgram, setSelectedProgram] = useState<'metadata' | 'core' | 'compressed'>('metadata');
  const [status, setStatus] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  // NFT Basic Info
  const [nftName, setNftName] = useState('');
  const [nftSymbol, setNftSymbol] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [nftImage, setNftImage] = useState<File | null>(null);
  const [royaltyBasisPoints, setRoyaltyBasisPoints] = useState(500); // 5%

  // Advanced Settings
  const [nonTransferable, setNonTransferable] = useState(false);
  const [isBurnable, setIsBurnable] = useState(true);
  const [isUpdatable, setIsUpdatable] = useState(true);

  // Thêm state mới cho cNFT
  const [nftQuantity, setNftQuantity] = useState<number>(1);
  const [maxDepth, setMaxDepth] = useState<number>(20);
  const [maxBufferSize, setMaxBufferSize] = useState<number>(256);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  const { uploadToIPFS } = useUploadToIPFS();

  // Thêm useEffect để tính toán độ sâu hợp lệ
  useEffect(() => {
    if (selectedProgram === 'compressed') {
      const getOptimalTreeConfig = (quantity: number) => {
        // Tính toán độ sâu tối thiểu cần thiết
        const minDepthNeeded = Math.ceil(Math.log2(quantity));
        
        // Tìm cấu hình phù hợp nhất
        const optimalConfig = VALID_TREE_CONFIGS.find(
          config => config.maxDepth >= minDepthNeeded
        ) || VALID_TREE_CONFIGS[0];
        
        return optimalConfig;
      };

      const calculateEstimatedCost = (depth: number) => {
        const baseTreeCost = 0.000001;
        const costPerLeaf = 0.0000001;
        const maxLeaves = Math.pow(2, depth);
        return baseTreeCost + (costPerLeaf * maxLeaves);
      };

      const optimalConfig = getOptimalTreeConfig(nftQuantity);
      
      setMaxDepth(optimalConfig.maxDepth);
      setMaxBufferSize(optimalConfig.maxBufferSize);
      setEstimatedCost(calculateEstimatedCost(optimalConfig.maxDepth));
    }
  }, [nftQuantity, selectedProgram]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNftImage(e.target.files[0]);
    }
  };

  const handleCreateNFT = async () => {
    if (!wallet.publicKey || !nftImage) {
      return;
    }

    setIsCreating(true);
    try {
      // Upload to IPFS
      setStatus('Uploading to IPFS...');
      const uploadResult = await uploadToIPFS(nftImage, {
        name: nftName,
        symbol: nftSymbol,
        description: nftDescription,
      });

      if (!uploadResult) {
        throw new Error('Failed to upload to IPFS');
      }

      const umi = createUmi('https://api.devnet.solana.com')
        .use(mplTokenMetadata())
        .use(mplCore())
        .use(mplBubblegum())
        .use(walletAdapterIdentity(wallet));

      if (selectedProgram === 'compressed') {
        try {
          // 1. Tạo Merkle Tree
          setStatus('Creating merkle tree...');
          const merkleTree = generateSigner(umi);
          
          const builder = await createTree(umi, {
            merkleTree,
            maxDepth: maxDepth,
            maxBufferSize: maxBufferSize,
            public: true,
          });

          await builder.sendAndConfirm(umi);

          // 2. Mint cNFTs in batches
          setStatus(`Preparing to mint ${nftQuantity} NFTs...`);
          
          // Chia thành các batch nhỏ, mỗi batch 5 NFT
          const BATCH_SIZE = 5;
          const batches = Math.ceil(nftQuantity / BATCH_SIZE);
          
          for (let batch = 0; batch < batches; batch++) {
            const startIdx = batch * BATCH_SIZE;
            const endIdx = Math.min((batch + 1) * BATCH_SIZE, nftQuantity);
            const batchSize = endIdx - startIdx;
            
            setStatus(`Minting batch ${batch + 1}/${batches} (NFTs ${startIdx + 1}-${endIdx})...`);
            
            const mintBuilders = Array.from({ length: batchSize }, (_, i) => 
              mintV1Compressed(umi, {
                leafOwner: umi.identity.publicKey,
                merkleTree: merkleTree.publicKey,
                metadata: {
                  name: `${nftName} #${startIdx + i + 1}`,
                  symbol: nftSymbol,
                  uri: uploadResult.metadataUri,
                  sellerFeeBasisPoints: royaltyBasisPoints,
                  collection: none(),
                  creators: [
                    {
                      address: umi.identity.publicKey,
                      verified: true,
                      share: 100,
                    },
                  ],
                },
              })
            );

            // Mint batch
            const batchGroup = transactionBuilderGroup(mintBuilders).parallel();
            await batchGroup.sendAndConfirm(umi);
          }
          
          setStatus('All NFTs created successfully!');
          toast.success(`Created ${nftQuantity} NFTs! 🎉`);

        } catch (error: Error | unknown) {
          console.error('Error creating NFTs:', error);
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Unknown error occurred';
          throw new Error(`Failed to create NFTs: ${errorMessage}`);
        }
      } else {
        // 3. Create NFT based on selected program and standard
        if (selectedProgram === 'metadata') {
          const mint = generateSigner(umi);
          if (selectedStandard === 'original') {
            await createNft(umi, {
              mint,
              name: nftName,
              symbol: nftSymbol,
              uri: uploadResult.metadataUri,
              sellerFeeBasisPoints: percentAmount(royaltyBasisPoints/100),
            }).sendAndConfirm(umi);
          } else {
            const mint = generateSigner(umi);
            await createV1(umi, {
              mint,
              authority: umi.identity,
              name: nftName,
              symbol: nftSymbol,
              uri: uploadResult.metadataUri,
              sellerFeeBasisPoints: percentAmount(royaltyBasisPoints/100),
              splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID,
              tokenStandard: TokenStandard.NonFungible,
            }).sendAndConfirm(umi);

            const token = findAssociatedTokenPda(umi, {
              mint: mint.publicKey,
              owner: umi.identity.publicKey,
              tokenProgramId: SPL_TOKEN_2022_PROGRAM_ID,
            });

            await mintV1Metadata(umi, {
              mint: mint.publicKey,
              token,
              authority: umi.identity,
              amount: 1,
              tokenOwner: umi.identity.publicKey,
              splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID,
              tokenStandard: TokenStandard.NonFungible,
            }).sendAndConfirm(umi);
          }
        } else {
          // MPL Core implementation
          setStatus('Creating NFT using MPL Core...');
          
          const assetSigner = generateSigner(umi);
          
          await create(umi, {
            asset: assetSigner,
            name: nftName,
            uri: uploadResult.metadataUri,
          }).sendAndConfirm(umi);

          setStatus('NFT created successfully with MPL Core!');
        }
      }

      setStatus('NFT created successfully!');
    } catch (error: Error | unknown) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create NFTs';
      toast.error(errorMessage);
      setStatus(`Error: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Create NFT</h1>

      {/* Step 1: Choose Metaplex Program */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">1. Choose Metaplex Program</h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedProgram('metadata')}
            className={`p-4 border rounded-lg ${
              selectedProgram === 'metadata' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <h3 className="font-medium">Token Metadata</h3>
            <p className="text-sm text-gray-600">Basic NFT features</p>
          </button>
          <button
            onClick={() => setSelectedProgram('core')}
            className={`p-4 border rounded-lg ${
              selectedProgram === 'core' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <h3 className="font-medium">MPL Core</h3>
            <p className="text-sm text-gray-600">Advanced NFT features</p>
          </button>
          <button
            onClick={() => setSelectedProgram('compressed')}
            className={`p-4 border rounded-lg ${
              selectedProgram === 'compressed' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <h3 className="font-medium">Compressed</h3>
            <p className="text-sm text-gray-600">State compression NFTs</p>
          </button>
        </div>
      </div>

      {/* Step 2: Choose Token Standard - Chỉ hiển thị khi chọn Token Metadata */}
      {selectedProgram === 'metadata' && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">2. Choose Token Standard</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedStandard('original')}
              className={`p-4 border rounded-lg ${
                selectedStandard === 'original' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <h3 className="font-medium">Original Token</h3>
              <p className="text-sm text-gray-600">Standard SPL Token Program</p>
            </button>
            <button
              onClick={() => setSelectedStandard('token2022')}
              className={`p-4 border rounded-lg ${
                selectedStandard === 'token2022' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <h3 className="font-medium">Token 2022</h3>
              <p className="text-sm text-gray-600">Enhanced features and extensions</p>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: NFT Details */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">3. NFT Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={nftName}
              onChange={(e) => setNftName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="NFT Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Symbol</label>
            <input
              type="text"
              value={nftSymbol}
              onChange={(e) => setNftSymbol(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="NFT Symbol"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={nftDescription}
              onChange={(e) => setNftDescription(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="NFT Description"
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
          <div>
            <label className="block text-sm font-medium mb-1">Royalty (%)</label>
            <input
              type="number"
              value={royaltyBasisPoints / 100}
              onChange={(e) => setRoyaltyBasisPoints(Number(e.target.value) * 100)}
              className="w-full p-2 border rounded"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Step 4: Advanced Settings */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">4. Advanced Settings</h2>
        <div className="space-y-2">
          {selectedStandard === 'token2022' && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={nonTransferable}
                onChange={(e) => setNonTransferable(e.target.checked)}
                className="mr-2"
              />
              Non-Transferable (Soul-bound)
            </label>
          )}

          {selectedProgram === 'core' && (
            <>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isBurnable}
                  onChange={(e) => setIsBurnable(e.target.checked)}
                  className="mr-2"
                />
                Burnable
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isUpdatable}
                  onChange={(e) => setIsUpdatable(e.target.checked)}
                  className="mr-2"
                />
                Updatable
              </label>
            </>
          )}
        </div>
      </div>

      {/* Thêm UI cho Compressed NFT settings khi selectedProgram === 'compressed' */}
      {selectedProgram === 'compressed' && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Compressed NFT Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Number of NFTs</label>
              <input
                type="number"
                min="1"
                max="10000000"
                value={nftQuantity}
                onChange={(e) => setNftQuantity(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Tree Depth: {maxDepth}</p>
              <p>Buffer Size: {maxBufferSize}</p>
              <p>Maximum Capacity: {Math.pow(2, maxDepth).toLocaleString()} NFTs</p>
              <p>Your Quantity: {nftQuantity.toLocaleString()} NFTs</p>
              <p>Estimated Cost: {estimatedCost.toFixed(6)} SOL</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleCreateNFT}
        disabled={isCreating || !wallet.publicKey}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isCreating ? 'Creating NFT...' : 'Create NFT'}
      </button>

      {status && (
        <p className="mt-4 text-center text-sm">{status}</p>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCore } from '@metaplex-foundation/mpl-core';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { useWallet } from '@solana/wallet-adapter-react';
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { publicKey, generateSigner } from '@metaplex-foundation/umi';
import { Card } from '@/components/Card';
import { MintNFTModal } from '@/components/MintNFTModal';
import { toast } from 'react-toastify';
import { create, fetchCollection } from '@metaplex-foundation/mpl-core';

interface NFT {
  id: string;
  name: string;
  image: string;
  description?: string;
  symbol?: string;
}

export default function CollectionNFTsPage() {
  const params = useParams();
  const collectionId = params.id as string;
  const wallet = useWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMintModal, setShowMintModal] = useState(false);
  const [mintLoading, setMintLoading] = useState(false);

  const fetchNFTs = async () => {
    if (!wallet.publicKey) return;

    try {
      setLoading(true);
      
      const umi = createUmi(`https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`)
        .use(mplCore())
        .use(dasApi())
        .use(walletAdapterIdentity(wallet));

      const nftsData = await umi.rpc.getAssetsByGroup({
        groupKey: 'collection',
        groupValue: collectionId,
      });

      console.log('NFTs Data:', nftsData);

      const formattedNFTs = await Promise.all(
        nftsData.items.map(async (nft) => {
          try {
            const assetData = await umi.rpc.getAsset(publicKey(nft.id));
            console.log('Asset Data:', assetData);

            let metadata = { 
              image: '',
              description: '',
              symbol: ''
            };

            if (assetData.content?.json_uri) {
              const response = await fetch(assetData.content.json_uri);
              metadata = await response.json();
              console.log('Metadata:', metadata);
            }

            return {
              id: nft.id,
              name: assetData.content?.metadata?.name || 'Unnamed NFT',
              image: metadata.image || '',
              description: metadata.description || assetData.content?.metadata?.description || '',
              symbol: metadata.symbol || assetData.content?.metadata?.symbol || ''
            };
          } catch (err) {
            console.error('Error fetching NFT data:', err);
            return {
              id: nft.id,
              name: 'Unnamed NFT',
              image: '',
              description: '',
              symbol: ''
            };
          }
        })
      );

      console.log('Formatted NFTs:', formattedNFTs);
      setNfts(formattedNFTs);
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch NFTs');
    } finally {
      setLoading(false);
    }
  };

  const handleMintNFT = async (data: { name: string; description: string; file: File }) => {
    if (!wallet.publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      setMintLoading(true);

      // 1. Upload file và metadata lên IPFS
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('tokenData', JSON.stringify({
        name: data.name,
        description: data.description
      }));

      const uploadResponse = await fetch('/api/token/upload', {
        method: 'POST',
        body: formData
      });
      const { metadataUri } = await uploadResponse.json();

      // 2. Mint NFT vào collection
      const umi = createUmi('https://api.devnet.solana.com')
        .use(mplCore())
        .use(dasApi())
        .use(walletAdapterIdentity(wallet));

      // Fetch existing collection
      const collection = await fetchCollection(umi, publicKey(collectionId));

      // Generate asset signer
      const assetSigner = generateSigner(umi);

      // Create NFT and add to collection
      await create(umi, {
        asset: assetSigner,
        name: data.name,
        uri: metadataUri,
        collection: collection,
      }).sendAndConfirm(umi);

      toast.success('NFT minted successfully!', {
        autoClose: 1000,
        position: 'top-center'
      });
      setShowMintModal(false);
      
      setTimeout(() => {
        fetchNFTs();
      }, 2000);

    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to mint NFT');
    } finally {
      setMintLoading(false);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, [wallet.publicKey, collectionId]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Collection NFTs</h1>
        <button
          onClick={() => setShowMintModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Mint New NFT
        </button>
      </div>

      {!wallet.publicKey ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Please connect your wallet</h2>
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Loading NFTs...</h2>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          <h2 className="text-xl font-semibold mb-4">{error}</h2>
        </div>
      ) : nfts.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">No NFTs found in this collection</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <Card
              key={nft.id}
              name={nft.name}
              image={nft.image}
              description={nft.description}
              symbol={nft.symbol}
              type="NFT"
              nftType="core"
              mintAddress={nft.id}
              collectionId={collectionId}
            />
          ))}
        </div>
      )}

      <MintNFTModal
        isOpen={showMintModal}
        onClose={() => setShowMintModal(false)}
        onMint={handleMintNFT}
        loading={mintLoading}
      />
    </div>
  );
} 
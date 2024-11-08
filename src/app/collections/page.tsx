'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { getCollectionV1GpaBuilder, mplCore } from '@metaplex-foundation/mpl-core';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import Link from 'next/link';
import { publicKey } from '@metaplex-foundation/umi';
import { Card } from '@/components/Card';

interface Collection {
  id: string;
  name: string;
  symbol: string;
  image: string;
  description?: string;
}

export default function CollectionsPage() {
  const wallet = useWallet();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!wallet.publicKey) return;

      try {
        setLoading(true);
        
        const umi = createUmi('https://api.devnet.solana.com')
          .use(mplCore())
          .use(walletAdapterIdentity(wallet));

        const builder = getCollectionV1GpaBuilder(umi)
          .whereField('key', 5)
          .whereField('updateAuthority', publicKey(wallet.publicKey.toString()));
        
        const collectionsData = await builder.getDeserialized();
        console.log('Found collections:', collectionsData);

        const formattedCollections: Collection[] = await Promise.all(
          collectionsData.map(async (collection) => {
            let image = '';
            try {
              const response = await fetch(collection.uri);
              const metadata = await response.json();
              image = metadata.image || '';
            } catch (err) {
              console.error('Error fetching metadata:', err);
            }

            return {
              id: collection.publicKey.toString(),
              name: collection.name,
              symbol: '',
              image: image,
              description: `Minted: ${collection.numMinted}, Size: ${collection.currentSize}`
            };
          })
        );

        setCollections(formattedCollections);
      } catch (err: any) {
        console.error('Error fetching collections:', err);
        setError(err.message || 'Failed to fetch collections');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [wallet.publicKey]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Collections</h1>
        <Link 
          href="/create/collections" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Collection
        </Link>
      </div>

      {!wallet.publicKey ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Please connect your wallet</h2>
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Loading collections...</h2>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          <h2 className="text-xl font-semibold mb-4">{error}</h2>
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">No collections found</h2>
          <p className="text-gray-600">Create your first collection to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card
              key={collection.id}
              id={collection.id}
              name={collection.name}
              image={collection.image}
              description={collection.description}
              type="NFT"
              onClick={() => {
                console.log('Clicked collection:', collection.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

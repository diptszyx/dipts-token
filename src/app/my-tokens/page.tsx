'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';

const rpcUrl = `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

interface AssetDisplay {
  id: string;
  name: string;
  image?: string;
  amount?: number;
  decimals?: number;
  type: 'NFT' | 'Token';
}

export default function MyTokens() {
  const { publicKey: walletPublicKey } = useWallet();
  const [nfts, setNfts] = useState<AssetDisplay[]>([]);
  const [tokens, setTokens] = useState<AssetDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      if (!walletPublicKey) return;
      
      try {
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'my-id',
            method: 'searchAssets',
            params: {
              ownerAddress: walletPublicKey.toBase58(),
              tokenType: 'all',
            },
          }),
        });

        const responseData = await response.json();
        console.log('Full API Response:', responseData);

        let assets = [];
        if (responseData.result && responseData.result.items) {
          assets = responseData.result.items;
        } else {
          console.warn('Unexpected API response structure:', responseData);
        }

        console.log('Raw assets:', assets);

        const processedAssets = await Promise.all(
          assets.map(async (asset: any) => {
            let image = '';
            let metadata = null;
            
            try {
              if (asset.content?.json_uri) {
                const response = await fetch(asset.content.json_uri);
                metadata = await response.json();
                image = metadata.image || '';
              }
            } catch (error) {
              console.warn('Error fetching metadata:', error);
            }

            if ( asset.interface === 'V1_NFT' || asset.interface === 'MplCoreAsset') {
              return {
                id: asset.id,
                name: asset.content?.metadata?.name || 'Unnamed NFT',
                image: image,
                type: 'NFT' as const
              };
            }

            if (asset.interface === 'FungibleToken') {
              const tokenInfo = asset.token_info;
              const rawBalance = tokenInfo?.balance || 0;
              const decimals = tokenInfo?.decimals || 0;
              
              console.log('Raw values:', {
                rawBalance,
                decimals,
                tokenInfo
              });
              
              const balance = rawBalance / Math.pow(10, decimals);
              
              return {
                id: asset.id,
                name: asset.content?.metadata?.name || 'Unnamed Token',
                image: image,
                amount: balance,
                decimals: decimals,
                type: 'Token' as const
              };
            }
          })
        );

        // Phân loại assets
        const nftAssets = processedAssets.filter(asset => asset?.type === 'NFT');
        const tokenAssets = processedAssets.filter(asset => asset?.type === 'Token');

        setNfts(nftAssets);
        setTokens(tokenAssets);
      } catch (error) {
        console.error('Error fetching assets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [walletPublicKey]);

  if (!walletPublicKey) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Please connect your wallet</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Loading assets...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* NFT Collections Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-8">My NFT </h2>
        {nfts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">No NFT collections found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <Card
                key={nft.id}
                id={nft.id}
                name={nft.name}
                image={nft.image}
                type="NFT"
                onClick={() => {
                  console.log('Clicked NFT:', nft.id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tokens Section */}
      <div>
        <h2 className="text-2xl font-bold mb-8">My Tokens</h2>
        {tokens.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">No tokens found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.map((token) => (
              <Card
                key={token.id}
                id={token.id}
                name={token.name}
                image={token.image}
                description={`Balance: ${token.amount}`}
                type="Token"
                amount={token.amount}
                decimals={token.decimals}
                onClick={() => {
                  console.log('Clicked token:', token.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';

const rpcUrl = `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

interface AssetDisplay {
  tokenAccountAddress?: string;
  name: string;
  image?: string;
  amount?: number;
  decimals?: number;
  type: 'NFT' | 'Token';
  mintAddress: string;
  nftType?: 'core' | 'compressed' | 'metadata';
  compressed?: boolean;
  burnt?: boolean;
  description?: string;
  symbol?: string;
}

interface TokenInfo {
  balance?: number;
  decimals?: number;
  associated_token_address?: string;
  token_program?: string;
}

interface AssetContent {
  json_uri?: string;
  metadata?: {
    name?: string;
    symbol?: string;
    description?: string;
  };
}

interface HeliusAsset {
  id: string;
  interface?: 'V1_NFT' | 'MplCoreAsset' | 'FungibleToken' | 'MplCoreCollection';
  content?: AssetContent;
  token_info?: TokenInfo;
  compression?: {
    eligible: boolean;
    compressed: boolean;
    data_hash: string;
    creator_hash: string;
    asset_hash: string;
  };
  burnt?: boolean;
  authorities?: Array<string>;
  ownership?: {
    frozen: boolean;
    delegated: boolean;
    delegate: string | null;
    ownership_model: string;
    owner: string;
  };
  royalty?: {
    royalty_model: string;
    target: string;
    percent: number;
    basis_points: number;
    primary_sale_happened: boolean;
  };
  supply?: {
    print_max_supply: number;
    print_current_supply: number;
    edition_nonce: number;
  };
  mutable?: boolean;
  grouping?: Array<{
    group_key: string;
    group_value: string;
  }>;
}

interface Metadata {
  name?: string;
  image?: string;
  description?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties?: {
    files?: Array<{
      uri: string;
      type: string;
    }>;
    category?: string;
  };
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
          assets
            .filter((asset: HeliusAsset) => {
              if (asset.burnt) return false;
              
              if (asset.grouping?.some(g => g.group_key === 'collection')) return false;
              
              if (asset.interface === 'MplCoreCollection') return false;
              
              return (
                asset.interface === 'V1_NFT' || 
                asset.interface === 'FungibleToken' ||
                (asset.interface === 'MplCoreAsset' && (!asset.grouping || asset.grouping.length === 0))
              );
            })
            .map(async (asset: HeliusAsset) => {
              let image = '';
              let metadata: Metadata | null = null;
              
              try {
                if (asset.content?.json_uri) {
                  const response = await fetch(asset.content.json_uri);
                  metadata = await response.json();
                  image = metadata?.image || '';
                }
              } catch (error) {
                console.warn('Error fetching metadata:', error);
              }

              if (asset.interface === 'V1_NFT' || asset.interface === 'MplCoreAsset') {
                return {
                  tokenAccountAddress: asset.token_info?.associated_token_address,
                  name: asset.content?.metadata?.name || 'Unnamed NFT',
                  image: image,
                  type: 'NFT' as const,
                  nftType: asset.compression?.compressed ? 'compressed' : 'metadata',
                  compressed: asset.compression?.compressed || false,
                  mintAddress: asset.id,
                  description: metadata?.description || '',
                  symbol: asset.content?.metadata?.symbol || ''
                };
              } else if (asset.interface === 'FungibleToken') {
                const tokenInfo = asset.token_info;
                const rawBalance = tokenInfo?.balance || 0;
                const decimals = tokenInfo?.decimals || 0;
                
                const balance = rawBalance / Math.pow(10, decimals);
                
                return {
                  tokenAccountAddress: asset.token_info?.associated_token_address,
                  name: asset.content?.metadata?.name || 'Unnamed Token',
                  image: image,
                  amount: balance,
                  decimals: decimals,
                  type: 'Token' as const,
                  mintAddress: asset.id,
                  description: metadata?.description || asset.content?.metadata?.description || '',
                  symbol: asset.content?.metadata?.symbol || ''
                };
              }
            })
        );

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
                key={nft.mintAddress}
                tokenAccountAddress={nft.tokenAccountAddress}
                mintAddress={nft.mintAddress}
                name={nft.name}
                image={nft.image}
                description={nft.description}
                symbol={nft.symbol}
                type="NFT"
                nftType={nft.nftType}
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
                key={token.mintAddress}
                tokenAccountAddress={token.tokenAccountAddress}
                mintAddress={token.mintAddress}
                name={`${token.name}`}
                image={token.image}
                description={token.description}
                symbol={token.symbol}
                type="Token"
                amount={token.amount}
                decimals={token.decimals}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

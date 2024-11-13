'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import { useTokenOperations } from '@/hooks/useTokenOperations';
import { BurnModal } from './BurnModal';
import { TokenDetailModal } from './TokenDetailModal';
import { toast } from 'react-toastify';
import { DelegateModal } from './DelegateModal';
import { TransferModal } from './TransferModal';

interface CardProps {
  name: string;
  image?: string;
  description?: string;
  tokenAccountAddress?: string;
  type?: 'NFT' | 'Token';
  amount?: number;
  decimals?: number;
  mintAddress?: string;
  nftType?: 'core' | 'compressed' | 'metadata';
  symbol?: string;
  collectionId?: string;
}

export function Card({ 
  name, 
  image = '', 
  description,
  symbol,
  tokenAccountAddress,
  mintAddress,
  amount = 0,
  decimals = 0,
  type,
  nftType,
  collectionId,
}: CardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBurnModal, setShowBurnModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { burnToken, burnNFT, closeTokenAccount, transferToken, delegateToken, transferNFT } = useTokenOperations();
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBurn = async (burnAmount?: number) => {
    if (!mintAddress) {
      console.error('Missing mintAddress');
      return;
    }
    
    try {
      setIsLoading(true);
      if (type === 'NFT') {
        if (!nftType) {
          console.error('Missing nftType for NFT');
          return;
        }
        const txid = await burnNFT(tokenAccountAddress, mintAddress, nftType, collectionId);
        console.log('NFT burned successfully:', txid);
        toast.success('NFT burned successfully!', {
          autoClose: 1000,
          position: 'top-center'
        });
        
      } else {
        if (burnAmount && tokenAccountAddress) {
          const txid = await burnToken(tokenAccountAddress, mintAddress, burnAmount, decimals);
          console.log('Token burned successfully:', txid);
          toast.success(`${burnAmount} ${symbol || ''} burned successfully!`, {
            autoClose: 1000,
            position: 'top-center'
          });
        }
      }

    } catch (error) {
      console.error('Error burning:', error);
      toast.error((error as Error).message || 'Burn failed', {
        autoClose: 1000,
        position: 'top-center'
      });
    } finally {
      setIsLoading(false);
      setShowMenu(false);
      setShowBurnModal(false);
    }
  };

  const handleBurnClick = () => {
    if (type === 'NFT') {
      // NFT requires direct confirmation
      const confirmed = window.confirm(`Are you sure you want to burn this NFT: ${name}?`);
      if (confirmed) {
        handleBurn();
      }
    } else {
      // FT opens amount selection modal
      setShowBurnModal(true);
    }
  };

  const handleCloseAccount = async () => {
    try {
      if (!tokenAccountAddress) {
        throw new Error('Token account address is required');
      }

      if (amount && amount > 0) {
        toast.error(
          'Cannot close account with non-zero balance. Please transfer or burn all tokens first.',
          {
            autoClose: 1000,
            position: 'top-center',
          }
        );
        return;
      }

      await closeTokenAccount(tokenAccountAddress, amount);
      toast.success('Account closed successfully!');
      // Có thể thêm callback để refresh danh sách token sau khi close
    } catch (error) {
      console.error('Error closing account:', error);
    }
  };

  const handleTransfer = async (toAddress: string, transferAmount?: number) => {
    try {
      if (!mintAddress) {
        throw new Error('Token information is missing');
      }

      setIsLoading(true);
      console.log('Transfer initiated:', {
        type,
        toAddress,
        transferAmount,
        amount,
        decimals,
        nftType,
        mintAddress
      });

      if (type === 'NFT') {
        if (!nftType) {
          throw new Error('NFT type is missing');
        }
        if (!toAddress) {
          throw new Error('Recipient address is required');
        }

        console.log('Transferring NFT:', {
          mintAddress,
          toAddress,
          nftType,

        });

        await transferNFT(mintAddress, toAddress, nftType, collectionId);
        toast.success('NFT transferred successfully!');
      } else {
        if (!transferAmount) {
          throw new Error('Transfer amount is required');
        }

        console.log('Parsed amount:', {
          transferAmount,
          currentBalance: amount
        });

        if (transferAmount > (amount || 0)) {
          throw new Error(`Insufficient balance. Have: ${amount}, Trying to send: ${transferAmount}`);
        }

        const result = await transferToken(
          tokenAccountAddress!,
          toAddress,
          mintAddress,
          transferAmount,
          decimals
        );
        console.log('Transfer result:', result);
        toast.success('Tokens transferred successfully!');
      }

      setShowTransferForm(false);
    } catch (error) {
      console.error('Transfer error details:', {
        error,
        message: (error as Error).message,
        stack: (error as Error).stack,
        type,
        nftType,
        mintAddress
      });
      toast.error((error as Error).message || 'Transfer failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelegate = async (delegateAddress: string, amount: number) => {
    try {
      if (!tokenAccountAddress || !mintAddress) {
        throw new Error('Token information is missing');
      }

      await delegateToken(
        tokenAccountAddress,
        mintAddress,
        delegateAddress,
        amount,
        decimals || 0
      );

      toast.success('Delegate successful!');
      
    } catch (error) {
      console.error('Delegate error:', error);
      toast.error((error as Error).message || 'Delegate failed');
    }
  };

  const getMenuItems = () => {
    const commonItems = [
      { 
        label: 'Transfer', 
        action: () => setShowTransferForm(true),
        variant: 'default'
      },
      { 
        label: 'Burn', 
        action: handleBurnClick,
        variant: 'danger'
      },
    ];

    if (type === 'Token') {
      return [
        ...commonItems,
        { 
          label: 'Delegate', 
          action: () => setShowDelegateModal(true),
          variant: 'default'
        },
        { 
          label: 'Close Account', 
          action: handleCloseAccount,
          variant: 'danger'
        },
      ];
    }

    return commonItems;
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Menu Button */}
      <div className="absolute top-2 right-2 z-10" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <EllipsisHorizontalIcon className="h-6 w-6 text-gray-500" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              {getMenuItems().map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    item.variant === 'danger' 
                      ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div 
        onClick={() => setShowDetails(true)}
        className="cursor-pointer"
      >
        {image && (
          <div className="aspect-square">
            <Image
              src={image}
              alt={name}
              className="w-full h-full object-cover"
              width={500}
              height={500}
            />
          </div>
        )}
        
        <div className="p-4">
          <h3 className="text-lg font-semibold">{name}</h3>
          {type === 'Token' && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Balance: {amount} {symbol}
            </p>
          )}
        </div>
      </div>

      {/* Transfer Form Modal */}
      <TransferModal
        isOpen={showTransferForm}
        onClose={() => setShowTransferForm(false)}
        onTransfer={handleTransfer}
        maxAmount={amount}
        tokenSymbol={symbol}
        isLoading={isLoading}
        isNFT={type === 'NFT'}
      />

      {/* Existing modals */}
      <TokenDetailModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        token={{
          name,
          image,
          description,
          symbol
        }}
      />

      {type === 'Token' && showBurnModal && (
        <BurnModal
          isOpen={showBurnModal}
          onClose={() => setShowBurnModal(false)}
          onBurn={handleBurn}
          maxAmount={amount}
          tokenName={name}
        />
      )}

      {/* Delegate Modal */}
      {type === 'Token' && (
        <DelegateModal
          isOpen={showDelegateModal}
          onClose={() => setShowDelegateModal(false)}
          onDelegate={handleDelegate}
          isLoading={isLoading}
          maxAmount={amount}
          tokenSymbol={symbol}
        />
      )}
    </div>
  );
} 

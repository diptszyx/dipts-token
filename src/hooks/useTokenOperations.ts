import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  createBurnCheckedInstruction, 
  TOKEN_PROGRAM_ID,
  createCloseAccountInstruction,
  createTransferCheckedInstruction,
  createApproveCheckedInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress
} from "@solana/spl-token";
import { PublicKey, Transaction } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { publicKey as publicKeyUmi } from '@metaplex-foundation/umi';
import { burn, fetchAsset, fetchCollection, transferV1 as transferCore } from '@metaplex-foundation/mpl-core';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { mplCore } from '@metaplex-foundation/mpl-core';
import { burnV1, mplTokenMetadata, TokenStandard, transferV1 as transferMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { getAssetWithProof, burn as burnCompressed, mplBubblegum, transfer as transferCompressed } from '@metaplex-foundation/mpl-bubblegum';

// Thêm Token-2022 Program ID
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

export function useTokenOperations() {
  const { connection } = useConnection();
  const { publicKey: walletPublicKey, signTransaction } = useWallet();
  const wallet = useWallet();

  const getTokenProgramId = async (mintAddress: string): Promise<PublicKey> => {
    try {
      const mintInfo = await connection.getAccountInfo(new PublicKey(mintAddress));
      if (!mintInfo) throw new Error('Mint not found');
      
      console.log('Mint Info:', {
        mintAddress,
        owner: mintInfo.owner.toString(),
        isToken2022: mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID)
      });
      
      return mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID) 
        ? TOKEN_2022_PROGRAM_ID 
        : TOKEN_PROGRAM_ID;
    } catch (error) {
      console.error('Error getting token program:', error);
      throw error;
    }
  };

  const burnToken = async (
    tokenAccountAddress: string, 
    mintAddress: string,
    amount: number,
    decimals: number
  ) => {
    if (!walletPublicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      const mintPubkey = new PublicKey(mintAddress);
      const tokenAccountPubkey = new PublicKey(tokenAccountAddress);

      // Xác định token program
      const programId = await getTokenProgramId(mintAddress);
      
      console.log('Token Program:', {
        programId: programId.toString(),
        isToken2022: programId.equals(TOKEN_2022_PROGRAM_ID)
      });

      const adjustedAmount = Math.floor(amount * Math.pow(10, decimals));

      // Tạo burn instruction với đúng program
      const transaction = new Transaction().add(
        createBurnCheckedInstruction(
          tokenAccountPubkey,
          mintPubkey,
          walletPublicKey,
          adjustedAmount,
          decimals,
          [],
          programId
        )
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPublicKey;

      const signed = await signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signed.serialize());
      
      await connection.confirmTransaction(txid, "confirmed");
      return txid;

    } catch (error) {
      console.error('Error burning token:', error);
      throw error;
    }
  };

  const burnNFT = async (
    tokenAccountAddress: string | undefined,
    mintAddress: string,
    nftType: 'core' | 'compressed' | 'metadata',
    collectionId?: string
  ) => {
    if (!walletPublicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const umi = createUmi('https://api.devnet.solana.com')
        .use(mplCore())
        .use(mplTokenMetadata())
        .use(mplBubblegum())
        .use(walletAdapterIdentity(wallet));

      if (collectionId) {
        const asset = await fetchAsset(umi, publicKeyUmi(mintAddress));
        const collection = await fetchCollection(umi, publicKeyUmi(collectionId));

        const tx = await burn(umi, {
          asset: asset,
          collection: collection,
        }).sendAndConfirm(umi);

        console.log('Collection NFT burned successfully:', tx);
        return tx;
      }

      if (nftType === 'core') {
        const asset = await fetchAsset(umi, publicKeyUmi(mintAddress));
        const tx = await burn(umi, {
          asset: asset,
        }).sendAndConfirm(umi);

        console.log('NFT Core burned successfully:', tx);
        return tx;
      } else if (nftType === 'compressed') {
        if (!wallet.publicKey) {
          throw new Error('Wallet public key is required');
        }

        const assetWithProof = await getAssetWithProof(umi, publicKeyUmi(mintAddress), {
          truncateCanopy: true
        });

        const tx = await burnCompressed(umi, {
          ...assetWithProof,
          leafOwner: publicKeyUmi(wallet.publicKey.toString()),
        }).sendAndConfirm(umi);

        console.log('Compressed NFT burned successfully:', tx);
        return tx;
      } else if (nftType === 'metadata') {
        if (!wallet.publicKey) {
          throw new Error('Wallet public key is required');
        }

        const tx = await burnV1(umi, {
          mint: publicKeyUmi(mintAddress),
          authority: umi.identity,
          tokenOwner: publicKeyUmi(wallet.publicKey.toString()),
          tokenStandard: TokenStandard.NonFungible,
        }).sendAndConfirm(umi);

        console.log('NFT Metadata burned successfully:', tx);
        return tx;
      }
    } catch (error) {
      console.error('Error burning NFT:', error);
      throw error;
    }
  };

  const closeTokenAccount = async (
    tokenAccountAddress: string,
    balance: number = 0
  ) => {
    if (!walletPublicKey) {
      throw new Error('Wallet not connected');
    }

    // Kiểm tra balance trước
    if (balance > 0) {
      throw new Error('Cannot close account with non-zero balance. Please transfer or burn all tokens first.');
    }

    try {
 
       const transaction = new Transaction().add(
        createCloseAccountInstruction(
          new PublicKey(tokenAccountAddress),
          walletPublicKey,
          walletPublicKey,
        )
      );

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('Token account closed successfully:', signature);
      return signature;

    } catch (error) {
      console.error('Error closing token account:', error);
      throw error;
    }
  };

  const transferToken = async (
    fromTokenAccount: string,
    toWalletAddress: string,
    mintAddress: string,
    amount: number,
    decimals: number
  ) => {
    console.log('Transfer Token Operation Started:', {
      fromTokenAccount,
      toWalletAddress,
      mintAddress,
      amount,
      decimals,
      walletConnected: !!walletPublicKey
    });

    if (!walletPublicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      if (isNaN(amount) || amount <= 0) {
        console.error('Amount validation failed:', {
          amount,
          isNaN: isNaN(amount),
          isPositive: amount > 0
        });
        throw new Error(`Invalid amount: ${amount}`);
      }

      const adjustedAmount = Math.floor(amount * Math.pow(10, decimals));
      console.log('Amount calculations:', {
        originalAmount: amount,
        decimals,
        adjustedAmount,
        powerOf10: Math.pow(10, decimals)
      });

      if (adjustedAmount <= 0) {
        throw new Error('Amount too small');
      }

      console.log('Transfer params:', {
        fromTokenAccount,
        toWalletAddress,
        mintAddress,
        amount,
        adjustedAmount,
        decimals
      });

      // Xác định token program ngay từ đầu
      const programId = await getTokenProgramId(mintAddress);
      
      console.log('Using Program ID:', programId.toString());

      // Tìm token account của người nhận với đúng program ID
      const destinationAta = await getAssociatedTokenAddress(
        new PublicKey(mintAddress),
        new PublicKey(toWalletAddress),
        true,  // allowOwnerOffCurve
        programId  // Sử dụng program ID đã xác định
      );

      const transaction = new Transaction();

      // Kiểm tra và tạo token account nếu cần
      const destinationAccount = await connection.getAccountInfo(destinationAta);
      if (!destinationAccount) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            walletPublicKey,
            destinationAta,
            new PublicKey(toWalletAddress),
            new PublicKey(mintAddress),
            programId  // Sử dụng program ID đã xác định
          )
        );
      }

      // Thêm lệnh transfer (phần này đã đúng)
      transaction.add(
        createTransferCheckedInstruction(
          new PublicKey(fromTokenAccount),
          new PublicKey(mintAddress),
          destinationAta,
          walletPublicKey,
          adjustedAmount,
          decimals,
          [],
          programId
        )
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPublicKey;

      const signed = await signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(txid);

      return txid;
    } catch (error) {
      console.error('Transfer Token Operation Error:', {
        error,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      throw error;
    }
  };

  const delegateToken = async (
    tokenAccountAddress: string,
    mintAddress: string,
    delegateAddress: string,
    amount: number,
    decimals: number
  ) => {
    if (!walletPublicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      // Xác định token program
      const programId = await getTokenProgramId(mintAddress);
      
      console.log('Delegate params:', {
        tokenAccount: tokenAccountAddress,
        mint: mintAddress,
        delegate: delegateAddress,
        amount,
        decimals,
        programId: programId.toString()
      });

      const adjustedAmount = Math.floor(amount * Math.pow(10, decimals));

      // Tạo approve instruction với đúng program
      const transaction = new Transaction().add(
        createApproveCheckedInstruction(
          new PublicKey(tokenAccountAddress), // token account
          new PublicKey(mintAddress),         // mint
          new PublicKey(delegateAddress),     // delegate
          walletPublicKey,                    // owner of token account
          adjustedAmount,                     // amount adjusted for decimals
          decimals,                           // decimals
          [],                                // multisigners
          programId                          // program id (Token or Token-2022)
        )
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPublicKey;

      const signed = await signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(txid, "confirmed");

      console.log('Delegate successful:', txid);
      return txid;

    } catch (error) {
      console.error('Error delegating token:', error);
      throw error;
    }
  };

  const transferNFT = async (
    mintAddress: string,
    newOwner: string,
    nftType: 'core' | 'compressed' | 'metadata',
    collectionId?: string
  ) => {
    if (!walletPublicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      // Chỉ kiểm tra Token-2022 cho metadata NFTs
      if (nftType === 'metadata') {
        const mintInfo = await connection.getAccountInfo(new PublicKey(mintAddress));
        if (!mintInfo) throw new Error('Mint not found');
        
        const isToken2022 = mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID);
        console.log('NFT Program Type:', {
          isToken2022,
          programId: mintInfo.owner.toString()
        });

        if (isToken2022) {
          const fromAta = await getAssociatedTokenAddress(
            new PublicKey(mintAddress),
            walletPublicKey,
            true,
            TOKEN_2022_PROGRAM_ID
          );

          const toAta = await getAssociatedTokenAddress(
            new PublicKey(mintAddress),
            new PublicKey(newOwner),
            true,
            TOKEN_2022_PROGRAM_ID
          );

          const transaction = new Transaction();

          // Kiểm tra và tạo token account đích nếu cần
          const destinationAccount = await connection.getAccountInfo(toAta);
          if (!destinationAccount) {
            transaction.add(
              createAssociatedTokenAccountInstruction(
                walletPublicKey,
                toAta,
                new PublicKey(newOwner),
                new PublicKey(mintAddress),
                TOKEN_2022_PROGRAM_ID
              )
            );
          }

          // Thêm lệnh transfer
          transaction.add(
            createTransferCheckedInstruction(
              fromAta,
              new PublicKey(mintAddress),
              toAta,
              walletPublicKey,
              1,
              0,
              [],
              TOKEN_2022_PROGRAM_ID
            )
          );

          const { blockhash } = await connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = walletPublicKey;

          const signed = await signTransaction(transaction);
          const txid = await connection.sendRawTransaction(signed.serialize());
          await connection.confirmTransaction(txid);
          return txid;
        }
      }

      // Xử lý các loại NFT thông thường
      const umi = createUmi('https://api.devnet.solana.com')
        .use(mplCore())
        .use(mplTokenMetadata())
        .use(mplBubblegum())
        .use(walletAdapterIdentity(wallet));

      // Nếu có collectionId, xử lý như collection NFT
      if (collectionId) {
        const tx = await transferCore(umi, {
          asset: publicKeyUmi(mintAddress),
          newOwner: publicKeyUmi(newOwner),
          collection: publicKeyUmi(collectionId), // Chỉ cần publicKey của collection
        }).sendAndConfirm(umi);

        return tx;
      }

      // Nếu không có collectionId, xử lý như NFT thông thường
      let tx;
      switch (nftType) {
        case 'core':
          tx = await transferCore(umi, {
            asset: publicKeyUmi(mintAddress),
            newOwner: publicKeyUmi(newOwner),
          }).sendAndConfirm(umi);
          break;

        case 'compressed':
          const assetWithProof = await getAssetWithProof(umi, publicKeyUmi(mintAddress), {
            truncateCanopy: true
          });
          tx = await transferCompressed(umi, {
            ...assetWithProof,
            leafOwner: publicKeyUmi(walletPublicKey.toString()),
            newLeafOwner: publicKeyUmi(newOwner),
          }).sendAndConfirm(umi);
          break;

        case 'metadata':
          tx = await transferMetadata(umi, {
            mint: publicKeyUmi(mintAddress),
            authority: umi.identity,
            tokenOwner: publicKeyUmi(walletPublicKey.toString()),
            destinationOwner: publicKeyUmi(newOwner),
            tokenStandard: TokenStandard.NonFungible,
          }).sendAndConfirm(umi);
          break;

        default:
          throw new Error(`Unsupported NFT type: ${nftType}`);
      }

      return tx;
    } catch (error) {
      console.error('NFT transfer failed:', error);
      throw error;
    }
  };

  return {
    burnToken,
    burnNFT,
    closeTokenAccount,
    transferToken,
    delegateToken,
    transferNFT,
  };
}
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { createBurnCheckedInstruction } from "@solana/spl-token";
// import { PublicKey, Transaction } from '@solana/web3.js';

// export function useTokenOperations() {
//   const { connection } = useConnection();
//   const { publicKey: walletPublicKey, signTransaction } = useWallet();

//   const burnToken = async (
//     tokenAccountAddress: string, 
//     mintAddress: string,
//     amount: number,
//     decimals: number
//   ) => {
//     if (!walletPublicKey || !signTransaction) {
//       throw new Error('Wallet not connected');
//     }

//     try {
//       // Convert addresses to PublicKey objects
//       const tokenAccountPubkey = new PublicKey(tokenAccountAddress);
//       const mintPubkey = new PublicKey(mintAddress);

//       // Calculate amount with decimals
//       const adjustedAmount = amount * Math.pow(10, decimals);

//       // Create transaction
//       const transaction = new Transaction().add(
//         createBurnCheckedInstruction(
//           tokenAccountPubkey,  // token account
//           mintPubkey,         // mint
//           walletPublicKey,    // owner
//           adjustedAmount,     // amount
//           decimals           // decimals
//         )
//       );

//       // Get recent blockhash
//       const { blockhash } = await connection.getLatestBlockhash();
//       transaction.recentBlockhash = blockhash;
//       transaction.feePayer = walletPublicKey;

//       // Sign and send transaction
//       const signed = await signTransaction(transaction);
//       const txid = await connection.sendRawTransaction(signed.serialize());
      
//       // Wait for confirmation
//       await connection.confirmTransaction(txid);

//       console.log(`Burn transaction hash: ${txid}`);
//       return txid;

//     } catch (error) {
//       console.error('Error burning token:', error);
//       throw error;
//     }
//   };

//   const transferToken = async (tokenAddress: string, destinationAddress: string, amount: number) => {
//     if (!walletPublicKey || !signTransaction) return;
//     try {
//       // Implement transfer logic
//     } catch (error) {
//       console.error('Error transferring token:', error);
//       throw error;
//     }
//   };

//   const delegateToken = async (tokenAddress: string, delegateAddress: string, amount: number) => {
//     if (!walletPublicKey || !signTransaction) return;
//     try {
//       // Implement delegate logic
//     } catch (error) {
//       console.error('Error delegating token:', error);
//       throw error;
//     }
//   };

//   const closeTokenAccount = async (tokenAddress: string) => {
//     if (!walletPublicKey || !signTransaction) return;
//     try {
//       // Implement close account logic
//     } catch (error) {
//       console.error('Error closing token account:', error);
//       throw error;
//     }
//   };

//   return {
//     burnToken,
//     transferToken,
//     delegateToken,
//     closeTokenAccount,
//   };
// } 
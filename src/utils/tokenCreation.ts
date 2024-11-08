import { 
  Umi, 
  generateSigner, 
  percentAmount,
  publicKey as umiPublicKey,
} from '@metaplex-foundation/umi';
import { 
  createV1, 
  mintV1,
  TokenStandard 
} from '@metaplex-foundation/mpl-token-metadata';
import { findAssociatedTokenPda } from '@metaplex-foundation/mpl-toolbox';

export const SPL_TOKEN_2022_PROGRAM_ID = umiPublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

export interface TokenMetadata {
  name: string;
  symbol: string;
  uri: string;
  decimals: number;
  amount: number;
}

export interface Token2022Metadata extends TokenMetadata {
  transferFeeEnabled?: boolean;
  transferFeeBasisPoints?: number;
  transferFeeReceiver?: string;
  nonTransferable?: boolean;
  requireMemo?: boolean;
}

// Thêm custom error
export class TokenCreationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenCreationError';
  }
}

// Thêm validation function
function validateMetadata(metadata: TokenMetadata | Token2022Metadata) {
  if (metadata.amount <= 0) {
    throw new TokenCreationError('Token amount must be greater than 0');
  }
  if (metadata.decimals < 0 || metadata.decimals > 9) {
    throw new TokenCreationError('Decimals must be between 0 and 9');
  }
  // Validate Token2022 specific fields
  if ('transferFeeEnabled' in metadata && metadata.transferFeeEnabled) {
    if (!metadata.transferFeeReceiver) {
      throw new TokenCreationError('Transfer fee receiver is required when transfer fee is enabled');
    }
    if (metadata.transferFeeBasisPoints! <= 0 || metadata.transferFeeBasisPoints! > 10000) {
      throw new TokenCreationError('Transfer fee basis points must be between 0 and 10000');
    }
  }
}

export async function createOriginalToken(umi: Umi, metadata: TokenMetadata) {
  try {
    validateMetadata(metadata);
    const mint = generateSigner(umi);

    await createV1(umi, {
      mint,
      authority: umi.identity,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      sellerFeeBasisPoints: percentAmount(0),
      decimals: metadata.decimals,
      tokenStandard: TokenStandard.Fungible,
    }).sendAndConfirm(umi);

    const token = findAssociatedTokenPda(umi, {
      mint: mint.publicKey,
      owner: umi.identity.publicKey,
    });

    await mintV1(umi, {
      mint: mint.publicKey,
      token,
      authority: umi.identity,
      amount: metadata.amount,
      tokenOwner: umi.identity.publicKey,
      tokenStandard: TokenStandard.Fungible,
    }).sendAndConfirm(umi);

    return mint.publicKey.toString();
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new TokenCreationError(`Failed to create original token: ${errorMessage}`);
  }
}

export async function createToken2022(umi: Umi, metadata: Token2022Metadata) {
  try {
    validateMetadata(metadata);
    const mint = generateSigner(umi);

    await createV1(umi, {
      mint,
      authority: umi.identity,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      sellerFeeBasisPoints: percentAmount(0),
      decimals: metadata.decimals,
      tokenStandard: TokenStandard.Fungible,
      splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID,
    }).sendAndConfirm(umi);

    const tokenAccount = findAssociatedTokenPda(umi, {
      mint: mint.publicKey,
      owner: umi.identity.publicKey,
      tokenProgramId: SPL_TOKEN_2022_PROGRAM_ID,
    });

    await mintV1(umi, {
      mint: mint.publicKey,
      token: tokenAccount,
      authority: umi.identity,
      amount: metadata.amount,
      tokenOwner: umi.identity.publicKey,
      tokenStandard: TokenStandard.Fungible,
      splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID,
    }).sendAndConfirm(umi);

    return mint.publicKey.toString();
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new TokenCreationError(`Failed to create Token-2022: ${errorMessage}`);
  }
}
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 gap-12">
      {/* Hero section */}
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Personal Token Manager
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Manage your digital assets easily on the Solana Blockchain
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Token Feature */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
          <div className="mb-6 relative w-32 h-32 mx-auto">
            <Image
              src="/images/token-illustration.png"
              alt="Token Feature"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold mb-3">Fungible Tokens</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Supports both Token-2022 and Original SPL Token standard
          </p>
        </div>

        {/* NFT Feature */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
          <div className="mb-6 relative w-32 h-32 mx-auto">
            <Image
              src="/images/nft-illustration.png"
              alt="NFT Feature"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold mb-3">NFT Collections</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage NFTs with Metaplex and Bubblegum
          </p>
        </div>

        {/* Blockchain Feature */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
          <div className="mb-6 relative w-32 h-32 mx-auto">
            <Image
              src="/images/blockchain-illustration.png"
              alt="Blockchain Feature"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold mb-3">Solana Blockchain</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Built on Solana to ensure high speed and low costs
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="w-full max-w-6xl mt-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-full md:w-1/2 h-64">
            <Image
              src="/images/wallet-illustration.png"
              alt="Wallet Connection"
              fill
              className="object-contain"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Simply connect your Solana wallet to start managing your tokens and NFTs.
              Full support for creating, transferring, and managing digital assets.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

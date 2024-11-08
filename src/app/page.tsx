import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      {/* Hero section */}
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Token Management Platform
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Nền tảng quản lý token an toàn và hiệu quả trên blockchain
        </p>
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mt-8">
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-2">Tổng Token</h3>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold">1,234</span>
            <span className="text-green-500 ml-2">+12.3%</span>
          </div>
        </div>
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-2">Tổng Giá Trị</h3>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold">$5.2M</span>
            <span className="text-red-500 ml-2">-2.5%</span>
          </div>
        </div>
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-2">Giao Dịch 24h</h3>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold">892</span>
            <span className="text-green-500 ml-2">+5.8%</span>
          </div>
        </div>
      </div>

      {/* Token list preview */}
      <div className="w-full max-w-4xl mt-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold mb-4">Token Phổ biến</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div>
                  <h3 className="font-semibold">Token #{i}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">0x1234...5678</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">$1,234.56</p>
                <p className="text-sm text-green-500">+2.34%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

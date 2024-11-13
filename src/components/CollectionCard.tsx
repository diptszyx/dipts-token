import Image from 'next/image';

interface CollectionCardProps {
  name: string;
  image?: string;
  description?: string;
  currentSize: number;
  numMinted: number;
  publicKey: string;
  onClick?: () => void;
}

export function CollectionCard({ 
  name, 
  image = '', 
  description,
  currentSize,
  numMinted,
  publicKey,
  onClick
}: CollectionCardProps) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer" 
      onClick={onClick}
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
        <div className="mt-2 text-sm text-gray-600">
          <p>Minted: {numMinted}</p>
          <p>Size: {currentSize}</p>
        </div>
        {description && (
          <p className="text-gray-600 mt-2 text-sm">{description}</p>
        )}
      </div>
    </div>
  );
} 
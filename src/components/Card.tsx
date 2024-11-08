'use client';

import Image from 'next/image';

interface CardProps {
  id?: string;
  name: string;
  image: string;
  description?: string;
  type?: string;
  amount?: number;
  decimals?: number;
  onClick?: () => void;
}

export function Card({ id, name, image, description, type, amount, decimals, onClick }: CardProps) {
  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
      <div onClick={onClick} className="cursor-pointer">
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
          {description && <p className="mt-2 text-gray-600">{description}</p>}
        </div>
      </div>
    </div>
  );
} 
import React from 'react';
import type { CatalogueItem } from '../types';

interface CatalogueCardProps {
  item: CatalogueItem;
}

export const CatalogueCard: React.FC<CatalogueCardProps> = ({ item }) => {
  return (
    <div className="w-screen h-screen flex-shrink-0 snap-center flex flex-col justify-center items-center px-6 py-12 relative">
      <div className="w-full max-w-md h-full flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-300">
        <div className="relative flex-grow w-full bg-gray-100 flex items-center justify-center overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
          {/* Subtle gradient overlay to make image look premium */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>
        </div>

        <div className="p-8 bg-white flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 leading-tight">
            {item.name}
          </h2>
          <p className="text-xl font-semibold text-blue-600">
            {item.price}
          </p>
        </div>
      </div>
    </div>
  );
};

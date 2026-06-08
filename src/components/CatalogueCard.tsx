import React from 'react';
import type { CatalogueNode } from '../types';

interface CatalogueCardProps {
  item: CatalogueNode;
  hasChildren?: boolean;
  onClick?: () => void;
}

export const CatalogueCard: React.FC<CatalogueCardProps> = ({ item, hasChildren = false, onClick }) => {
  const cardContent = (
    <>
      <div className="catalogue-card-media relative flex-1 min-h-0 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
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

      <div className="catalogue-card-content shrink-0 p-5 sm:p-8 bg-white flex flex-col items-center text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 leading-tight">
          {item.name}
        </h2>
        <p className="text-lg sm:text-xl font-semibold text-blue-600">
          {item.price}
        </p>
        {hasChildren && (
          <div className="catalogue-card-action mt-4 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            View details
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="catalogue-slide flex-shrink-0 snap-center flex flex-col justify-center items-center relative">
      {hasChildren ? (
        <button
          type="button"
          className="catalogue-card flex min-h-0 flex-col bg-white rounded-3xl shadow-xl overflow-hidden text-left focus:outline-none focus:ring-4 focus:ring-blue-200"
          onClick={onClick}
          aria-label={`View options for ${item.name}`}
        >
          {cardContent}
        </button>
      ) : (
        <div className="catalogue-card flex min-h-0 flex-col bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-300">
          {cardContent}
        </div>
      )}
    </div>
  );
};

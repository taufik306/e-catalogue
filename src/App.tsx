import { useEffect, useState } from 'react';
import type { CatalogueItem } from './types';
import { fetchCatalogueData } from './utils/api';
import { CatalogueCard } from './components/CatalogueCard';

function App() {
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCatalogueData();
        setItems(data);
      } catch (error) {
        console.error("Failed to load catalogue", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-50 text-gray-600 text-xl">
        No items found in catalogue.
      </div>
    );
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-50 overflow-hidden relative">
      {/* Horizontal Scroll Container */}
      <div
        className="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth hide-scrollbar"
        onScroll={handleScroll}
      >
        {items.map((item) => (
          <CatalogueCard key={item.id} item={item} />
        ))}
      </div>

      {/* Pagination indicators (Dots) */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2 pointer-events-none">
        {items.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full shadow-sm transition-all duration-300 ${
              idx === activeIndex ? 'bg-blue-600 opacity-100 scale-125' : 'bg-gray-400 opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default App;

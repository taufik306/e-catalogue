import { useEffect, useRef, useState } from 'react';
import type { CatalogueNode } from './types';
import { fetchCatalogueData } from './utils/api';
import { CatalogueCard } from './components/CatalogueCard';

function App() {
  const [navigationStack, setNavigationStack] = useState<CatalogueNode[][]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const currentItems = navigationStack[navigationStack.length - 1] || [];

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCatalogueData();
        setNavigationStack([data]);
      } catch (error) {
        console.error("Failed to load catalogue", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [navigationStack.length]);

  if (loading) {
    return (
      <div className="app-viewport w-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (currentItems.length === 0) {
    return (
      <div className="app-viewport w-screen flex items-center justify-center bg-gray-50 text-gray-600 text-xl">
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

  const handleItemClick = (item: CatalogueNode) => {
    if (item.children.length === 0) {
      return;
    }

    setNavigationStack((stack) => [...stack, item.children]);
    setActiveIndex(0);
  };

  const handleBack = () => {
    setNavigationStack((stack) => stack.length > 1 ? stack.slice(0, -1) : stack);
    setActiveIndex(0);
  };

  return (
    <div className="app-viewport w-screen bg-gray-50 overflow-hidden relative">
      {navigationStack.length > 1 && (
        <button
          type="button"
          className="absolute top-4 left-4 z-10 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-700 shadow-md backdrop-blur transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={handleBack}
        >
          Back
        </button>
      )}

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth hide-scrollbar"
        onScroll={handleScroll}
      >
        {currentItems.map((item) => (
          <CatalogueCard
            key={item.id}
            item={item}
            hasChildren={item.children.length > 0}
            onClick={() => handleItemClick(item)}
          />
        ))}
      </div>

      {/* Pagination indicators (Dots) */}
      <div className="pagination-dots absolute left-0 right-0 flex justify-center space-x-2 pointer-events-none">
        {currentItems.map((_, idx) => (
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

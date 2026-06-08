import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CatalogueNode } from './types';
import { fetchCatalogueData } from './utils/api';
import { CatalogueCard } from './components/CatalogueCard';

interface CatalogueLevel {
  items: CatalogueNode[];
  activeIndex: number;
}

type LevelAnimation = 'idle' | 'enter-from-bottom' | 'exit-to-bottom' | 'enter-from-top';

const LEVEL_ENTER_ANIMATION_MS = 320;
const LEVEL_EXIT_ANIMATION_MS = 260;

function App() {
  const [navigationStack, setNavigationStack] = useState<CatalogueLevel[]>([]);
  const [levelAnimation, setLevelAnimation] = useState<LevelAnimation>('idle');
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pendingScrollIndexRef = useRef(0);
  const levelAnimationTimeoutRef = useRef<number | null>(null);

  const currentLevel = navigationStack[navigationStack.length - 1];
  const currentItems = currentLevel?.items || [];
  const activeIndex = currentLevel?.activeIndex || 0;

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCatalogueData();
        pendingScrollIndexRef.current = 0;
        setNavigationStack([{ items: data, activeIndex: 0 }]);
      } catch (error) {
        console.error("Failed to load catalogue", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => () => {
    if (levelAnimationTimeoutRef.current) {
      window.clearTimeout(levelAnimationTimeoutRef.current);
    }
  }, []);

  useLayoutEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.scrollLeft = pendingScrollIndexRef.current * scrollContainer.offsetWidth;
    }
  }, [navigationStack.length]);

  const playLevelEnterAnimation = (direction: Extract<LevelAnimation, 'enter-from-bottom' | 'enter-from-top'>) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (levelAnimationTimeoutRef.current) {
      window.clearTimeout(levelAnimationTimeoutRef.current);
    }

    if (prefersReducedMotion) {
      setLevelAnimation('idle');
      return;
    }

    setLevelAnimation(direction);
    levelAnimationTimeoutRef.current = window.setTimeout(() => {
      setLevelAnimation('idle');
    }, LEVEL_ENTER_ANIMATION_MS);
  };

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
    if (width === 0) {
      return;
    }

    const lastIndex = Math.max(currentItems.length - 1, 0);
    const newIndex = Math.min(Math.max(Math.round(scrollLeft / width), 0), lastIndex);
    if (newIndex !== activeIndex) {
      setNavigationStack((stack) => stack.map((level, index) => (
        index === stack.length - 1
          ? { ...level, activeIndex: newIndex }
          : level
      )));
    }
  };

  const handleItemClick = (item: CatalogueNode, itemIndex: number) => {
    if (item.children.length === 0) {
      return;
    }

    pendingScrollIndexRef.current = 0;
    playLevelEnterAnimation('enter-from-bottom');
    setNavigationStack((stack) => [
      ...stack.map((level, index) => (
        index === stack.length - 1
          ? { ...level, activeIndex: itemIndex }
          : level
      )),
      { items: item.children, activeIndex: 0 },
    ]);
  };

  const handleBack = () => {
    if (navigationStack.length <= 1 || levelAnimation !== 'idle') {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const navigateBack = () => {
      setNavigationStack((stack) => {
        if (stack.length <= 1) {
          return stack;
        }

        const nextStack = stack.slice(0, -1);
        pendingScrollIndexRef.current = nextStack[nextStack.length - 1]?.activeIndex || 0;
        return nextStack;
      });
    };

    if (levelAnimationTimeoutRef.current) {
      window.clearTimeout(levelAnimationTimeoutRef.current);
    }

    if (prefersReducedMotion) {
      navigateBack();
      setLevelAnimation('idle');
      return;
    }

    setLevelAnimation('exit-to-bottom');
    levelAnimationTimeoutRef.current = window.setTimeout(() => {
      navigateBack();
      playLevelEnterAnimation('enter-from-top');
    }, LEVEL_EXIT_ANIMATION_MS);
  };

  const scrollerAnimationClass = {
    idle: '',
    'enter-from-bottom': 'catalogue-scroller-enter-from-bottom',
    'exit-to-bottom': 'catalogue-scroller-exit-to-bottom',
    'enter-from-top': 'catalogue-scroller-enter-from-top',
  }[levelAnimation];

  return (
    <div className="app-viewport w-screen bg-gray-50 overflow-hidden relative">
      {navigationStack.length > 1 && (
        <button
          type="button"
          className="absolute top-4 left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={handleBack}
          disabled={levelAnimation !== 'idle'}
          aria-label="Go back"
          title="Go back"
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Horizontal Scroll Container */}
      <div
        ref={scrollContainerRef}
        className={`catalogue-scroller ${scrollerAnimationClass} w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth hide-scrollbar`}
        onScroll={handleScroll}
      >
        {currentItems.map((item, index) => (
          <CatalogueCard
            key={item.id}
            item={item}
            hasChildren={item.children.length > 0}
            onClick={() => handleItemClick(item, index)}
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

import { useSEO } from "@/hooks/useSEO";
import '@/styles/detail-page.css';

const ScenariosPage = () => {
  useSEO({
    title: 'Сценарии - UI/UX Design Scenarios',
    description: 'UI/UX dizayn scenariylar to\'plami. User flow va interaction patternlari.',
    keywords: 'UI scenarios, UX scenarios, user flows, interaction patterns, mobile app scenarios',
    ogUrl: 'https://inspiro.com/scenarios',
  });

  return (
    <div className="detail-page">
      <div className="detail-page__not-found" style={{ padding: '60px 24px', textAlign: 'center', fontSize: '24px', color: '#888' }}>
        Скоро...
      </div>
    </div>
  );
};

export default ScenariosPage;

/* ========== COMMENTED OUT – restore when scenarios page is ready ==========
import { useState, useRef, useEffect, useCallback } from "react";
import contentData from "@/data/content";
import { SCENARIO_CATEGORIES } from "@/constants";
import { useCategories } from "@/hooks/useCategories";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import '@/styles/header-search.css';

const SCENARIO_COUNTS: Record<string, number> = {
  '': 12, '/search': 2, '/login': 3, '/cancel': 5, '/order': 2,
};

  const { categories } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const filterOptions = [{ id: '', name: 'Все' }, ...categories];
  const [activeFilter, setActiveFilter] = useState<string>(filterOptions[0]?.id ?? '');
  useEffect(() => {
    if (filterOptions.length && !filterOptions.some((c) => c.id === activeFilter)) setActiveFilter(filterOptions[0]?.id ?? '');
  }, [categories]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const filtersRef = useRef<HTMLUListElement>(null);
  const screens = contentData.map((item) => ({
    id: item.id, screenId: item.screenId, image: item.logo ?? item.images?.[0] ?? '', title: item.app_name,
  }));
  const firstItem = contentData[0] || null;
  const subCategories = SCENARIO_CATEGORIES.map((category) => ({
    id: category.path, label: category.label, count: SCENARIO_COUNTS[category.path] || 0,
  }));
  const treeStructure = [ ... ];
  const [activeTreeItem, setActiveTreeItem] = useState<string | null>(null);
  ... rest of component JSX (sidebar, filters, grid, modal) ...
========== END COMMENTED OUT ========== */

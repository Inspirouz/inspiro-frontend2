import { useState } from "react";
import { NavLink } from "react-router-dom";
import contentData from "@/data/content";
import { PATTERN_CATEGORIES } from "@/constants";
import Card from "@/components/Card";
import Modal from "@/components/Modal";
import { useSEO } from "@/hooks/useSEO";
import type { ContentItem } from '@/types';
import '@/styles/header-search.css';

const PatternsPage = () => {
  // SEO optimization
  useSEO({
    title: 'Patterns - UI/UX Design Patterns',
    description: 'UI/UX dizayn patternlar to\'plami. Zamonaviy dizayn yechimlari va best practices.',
    keywords: 'UI patterns, UX patterns, design patterns, interface patterns, user experience patterns',
    ogUrl: 'https://inspiro.com/patterns',
  });
  const [modalActive, setModalActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const handleItemClick = (item: ContentItem) => {
    setSelectedItem(item);
    setModalActive(true);
  };

  return (
    <>
      <div className="patterns-block">
        <div className="patterns-panel">
          {PATTERN_CATEGORIES.map((category) => (
            <NavLink
              key={category.path}
              className="P_nav_links"
              to={category.path}
            >
              {category.label}
            </NavLink>
          ))}
        </div>
        <div className="main-content-view__patterns">
          {contentData.map((item) => (
            <Card
              key={item.id}
              item={item}
              onClick={handleItemClick}
              variant="pattern"
            />
          ))}
        </div>
      </div>
      <Modal active={modalActive} setActive={setModalActive}>
        <div className="list_modal__info">
          {selectedItem ? (
            <p>Pattern ID: {selectedItem.id} - {selectedItem.app_name}</p>
          ) : (
            <p>Not Found id-element</p>
          )}
        </div>
      </Modal>
    </>
  );
};

export default PatternsPage;


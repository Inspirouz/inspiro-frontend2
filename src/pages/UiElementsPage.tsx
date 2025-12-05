import { useSEO } from "@/hooks/useSEO";

const UiElementsPage = () => {
  // SEO optimization
  useSEO({
    title: 'UI Elements - Design Components',
    description: 'UI elementlar va komponentlar to\'plami. Zamonaviy dizayn komponentlari va best practices.',
    keywords: 'UI elements, design components, interface elements, UI components, design system',
    ogUrl: 'https://inspiro.com/ui_elements',
  });

  return (
    <div className="p-10 text-center">
      <p className="text-2xl text-text-secondary">Скоро...</p>
    </div>
  );
};

export default UiElementsPage;


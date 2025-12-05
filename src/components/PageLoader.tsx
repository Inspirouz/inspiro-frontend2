const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-text-secondary text-lg">Загрузка...</p>
      </div>
    </div>
  );
};

export default PageLoader;







import { useState, useEffect } from 'react';
import { useNews } from '../../../../domain/news/useNews';
import { type NewsItem } from '../../../../domain/news/news.types';
import { markdownToHtml } from '../../../../domain/content/markdown';
import { useApp } from '../../../../contexts/AppContext';

export function NewsApp() {
  const { news, loading } = useNews();
  const { language } = useApp();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // Auto-select the first news item when news list loads
  useEffect(() => {
    if (news.length > 0 && !selectedNews) {
      setSelectedNews(news[0]);
    }
  }, [news, selectedNews]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white text-sm text-gray-600">
        {language === 'ru' ? 'Загрузка новостей...' : 'Loading news...'}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-white text-sm text-gray-500 p-4 text-center">
        {language === 'ru' 
          ? 'Новости отсутствуют.' 
          : 'No news items available.'}
      </div>
    );
  }

  return (
    <div className="news-app flex h-full bg-white select-text">
      {/* Sidebar for news list */}
      <aside className="news-app__sidebar os-sidebar flex flex-col w-64 md:w-72 border-r select-none">
        {/* Sidebar Header */}
        <div className="os-toolbar p-3 flex flex-col gap-1 border-b">
          <h3 className="font-bold text-sm">
            {language === 'ru' ? 'Лента новостей' : 'News Feed'}
          </h3>
          <span className="text-[11px] opacity-75">
            {language === 'ru' 
              ? `${news.length} публикаций` 
              : `${news.length} publications`}
          </span>
        </div>

        {/* Scrollable list */}
        <div className="news-app__list os-list flex-1 overflow-y-auto p-1 space-y-1">
          {news.map((item) => {
            const formattedDate = item.date 
              ? new Date(item.date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US') 
              : '';
            const isActive = selectedNews?.id === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setSelectedNews(item)}
                className={`news-app__list-item os-list-item w-full text-left rounded p-2 flex flex-col gap-1 ${
                  isActive ? 'selected os-list-item--selected' : ''
                }`}
              >
                <div className="font-semibold text-xs truncate w-full">
                  {item.title}
                </div>
                {formattedDate && (
                  <span className="text-[10px] opacity-60">
                    {formattedDate}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Reader View */}
      <section className="news-app__reader os-panel flex-1 flex flex-col min-w-0">
        {selectedNews ? (
          <div className="flex flex-col h-full overflow-y-auto p-6">
            {/* Header section */}
            <div className="border-b pb-4 mb-4 select-none">
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                {selectedNews.title}
              </h2>
              <div className="flex flex-wrap gap-2 text-xs opacity-75">
                <span>
                  {selectedNews.date 
                    ? new Date(selectedNews.date).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US') 
                    : ''}
                </span>
                {selectedNews.category && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{selectedNews.category}</span>
                  </>
                )}
              </div>
            </div>

            {/* Markdown rendered body */}
            <article 
              className="prose max-w-none text-sm break-words"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(selectedNews.content) }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm select-none">
            {language === 'ru' ? 'Выберите новость слева' : 'Select a news item from the list'}
          </div>
        )}
      </section>
    </div>
  );
}

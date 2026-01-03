import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Folder, ArrowLeft } from 'lucide-react';
import { loadWikiArticles, type ContentItem } from '../../utils/contentLoader';
import { Notepad } from '../notepad';
import { useApp } from '../../contexts/AppContext';

interface WikiFile {
  id: string;
  title: string;
  content: string;
  date?: string;
}

interface WikiCategory {
  id: string;
  name: string;
  files: WikiFile[];
  children: WikiCategory[];
}

interface WikiCategoryNode extends WikiCategory {
  childrenMap: Map<string, WikiCategoryNode>;
}

const createCategoryNode = (id: string, name: string): WikiCategoryNode => ({
  id,
  name,
  files: [],
  children: [],
  childrenMap: new Map(),
});

const buildWikiTree = (items: ContentItem[]): WikiCategory[] => {
  const rootMap = new Map<string, WikiCategoryNode>();
  const ensureNode = (map: Map<string, WikiCategoryNode>, id: string, name: string) => {
    if (!map.has(id)) {
      map.set(id, createCategoryNode(id, name));
    }
    return map.get(id)!;
  };

  items.forEach((item) => {
    const segments = item.pathSegments && item.pathSegments.length > 0 ? item.pathSegments : ['Wiki'];
    let currentMap = rootMap;
    let currentNode: WikiCategoryNode | null = null;

    segments.forEach((segment, index) => {
      const pathId = currentNode ? `${currentNode.id}/${segment}` : segment;
      const node = ensureNode(currentMap, pathId, segment);
      currentNode = node;
      currentMap = node.childrenMap;
    });

    const targetNode = currentNode ?? ensureNode(rootMap, 'Wiki', 'Wiki');
    targetNode.files.push({
      id: item.id,
      title: item.title,
      content: item.content,
      date: item.date,
    });
  });

  const sortCategories = (node: WikiCategoryNode): WikiCategory => {
    const sortedChildren = Array.from(node.childrenMap.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(sortCategories);

    return {
      id: node.id,
      name: node.name,
      files: node.files.sort((a, b) => a.title.localeCompare(b.title)),
      children: sortedChildren,
    };
  };

  return Array.from(rootMap.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(sortCategories);
};

const findFirstFile = (categories: WikiCategory[]): WikiFile | null => {
  for (const category of categories) {
    if (category.files.length > 0) {
      return category.files[0];
    }
    const childFile = findFirstFile(category.children);
    if (childFile) {
      return childFile;
    }
  }
  return null;
};

export function WikiApp() {
  const { language } = useApp();
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<WikiFile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<WikiCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadWikiArticles(undefined, language).then((articles) => {
      const tree = buildWikiTree(articles);
      setCategories(tree);
      setExpanded(new Set(tree.map((cat) => cat.id)));
      // Выбираем первую категорию по умолчанию
      if (tree.length > 0) {
        const firstCategory = tree[0].children.length > 0 ? tree[0].children[0] : tree[0];
        setSelectedCategory(firstCategory);
      }
      setLoading(false);
    });
  }, [language]);

  const toggleCategory = (categoryId: string) => {
    setExpanded((prev) => {
      const updated = new Set(prev);
      if (updated.has(categoryId)) {
        updated.delete(categoryId);
      } else {
        updated.add(categoryId);
      }
      return updated;
    });
  };

  const handleCategoryClick = (category: WikiCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    // Закрываем просмотр файла и открываем категорию
    setSelectedFile(null);
    setSelectedCategory(category);
    // Раскрываем категорию если она была свёрнута
    if (!expanded.has(category.id)) {
      toggleCategory(category.id);
    }
  };

  // Подсчёт всех заметок в категории и подкатегориях
  const countFiles = (category: WikiCategory): number => {
    let count = category.files.length;
    category.children.forEach(child => {
      count += countFiles(child);
    });
    return count;
  };

  // Получить все файлы из категории и подкатегорий
  const getAllFiles = (category: WikiCategory): WikiFile[] => {
    let allFiles = [...category.files];
    category.children.forEach(child => {
      allFiles = allFiles.concat(getAllFiles(child));
    });
    return allFiles;
  };

  const renderCategory = (category: WikiCategory, level = 0) => {
    const hasChildren = category.children.length > 0;
    const categoryId = category.id;
    const isExpanded = expanded.has(categoryId);
    const isSelected = selectedCategory?.id === categoryId;
    const filesCount = countFiles(category);

    return (
      <div key={categoryId}>
        <div
          className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded ${
            isSelected ? 'bg-blue-100' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={(e) => {
            handleCategoryClick(category, e);
          }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <div className="w-4" />
          )}
          <Folder size={14} className="text-blue-600" />
          <span className="font-semibold flex-1">{category.name}</span>
          {filesCount > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {filesCount}
            </span>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-2">
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center text-sm text-gray-500">Загрузка Wiki...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white">
      <aside className="w-64 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b bg-blue-600 text-white">
          <h2 className="font-bold text-lg">Wiki</h2>
          <p className="text-xs text-blue-100">Категории и заметки</p>
        </div>
        <div className="p-2">
          {categories.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-6">Wiki пуст</div>
          ) : (
            categories.map((category) => renderCategory(category))
          )}
        </div>
      </aside>

      <section className="flex-1 min-h-0 bg-white overflow-y-auto">
        {selectedFile ? (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedFile(null)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <ArrowLeft size={16} />
                Назад к категории
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Notepad initialContent={selectedFile.content} />
            </div>
          </div>
        ) : selectedCategory ? (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedCategory.name}</h2>
              <p className="text-sm text-gray-500">
                {countFiles(selectedCategory)} {countFiles(selectedCategory) === 1 ? 'статья' : 'статей'}
              </p>
            </div>
            
            {(() => {
              const allFiles = getAllFiles(selectedCategory);
              return allFiles.length > 0 ? (
                <div className="grid gap-4">
                  {allFiles.map((file) => (
                    <div
                      key={file.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className="flex items-start gap-3">
                        <FileText size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 mb-1">{file.title}</h3>
                          {file.date && (
                            <p className="text-xs text-gray-500">
                              Обновлено: {file.date}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <FileText size={48} className="mx-auto mb-4 opacity-40" />
                  <p>В этой категории пока нет статей</p>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Folder size={48} className="mx-auto mb-4 opacity-40" />
              <p>Выберите категорию слева</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

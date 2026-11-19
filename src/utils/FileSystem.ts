import React from 'react';
import folderIcon from '../themes/winxp/assets/icons/folder_plain.png';
import textIcon from '../themes/winxp/assets/icons/doc.png';
import { WINXP_ASSETS } from '../themes/winxp/themeAssets';
import userIcon from '../themes/winxp/assets/user.gif';
import documentsFolderIcon from '../themes/winxp/assets/icons/folder-documents.png';
import picturesFolderIcon from '../themes/winxp/assets/icons/folder-pictures.png';
import gamesFolderIcon from '../themes/winxp/assets/icons/My Games.png';

export interface FileSystemItem {
    id: string;
    name: string;
    type: 'folder' | 'file' | 'drive' | 'system';
    icon?: string | React.ReactNode;
    content?: string;
    children?: Record<string, FileSystemItem>;
    size?: string;
    appId?: string;
}

const defaultTextIcon = WINXP_ASSETS.richTextIcon ?? WINXP_ASSETS.notepadIcon ?? textIcon;

type FileSystemChildren = Record<string, FileSystemItem>;

const projectModules = import.meta.glob('../content/projects/**/*.{md,txt}', {
    query: '?raw',
    import: 'default',
    eager: true,
}) as Record<string, string>;

const videoModules = import.meta.glob('../content/videos/**/*.{mp4,webm,mov,m4v}', {
    query: '?url',
    import: 'default',
    eager: true,
}) as Record<string, string>;

const videoChildren: FileSystemChildren = Object.entries(videoModules).reduce((children, [path, url]) => {
    const name = path.split('/').pop() || 'video';
    children[name] = { id: `video:${name}`, name, type: 'file', icon: defaultTextIcon, content: url };
    return children;
}, {} as FileSystemChildren);

const pictureModules = import.meta.glob('../content/pictures/**/*.{jpg,jpeg,png,gif,webp}', {
    query: '?url',
    import: 'default',
    eager: true,
}) as Record<string, string>;

const pictureChildren: FileSystemChildren = (() => {
    const root: FileSystemChildren = {};
    Object.entries(pictureModules).forEach(([path, url]) => {
        const relative = path.split('../content/pictures/')[1];
        if (!relative) return;
        const segments = relative.split('/');
        const fileName = segments.pop();
        if (!fileName) return;
        let current = root;
        let prefix = 'my-pictures';
        segments.forEach((segment) => {
            if (!current[segment]) current[segment] = { id: `${prefix}/${segment}`, name: segment, type: 'folder', children: {} };
            current = current[segment].children!;
            prefix += `/${segment}`;
        });
        current[fileName] = { id: `picture:${relative}`, name: fileName, type: 'file', icon: url, content: url };
    });
    const blissImage = pictureModules['../content/pictures/wallpapers/windows/winxp-bliss.jpg'];
    if (blissImage) root['Bliss.jpg'] = { id: 'picture:bliss', name: 'Bliss.jpg', type: 'file', icon: blissImage, content: blissImage };
    return root;
})();

const projectChildren: FileSystemChildren = (() => {
    const root: FileSystemChildren = {};

    const ensureFolder = (children: FileSystemChildren, folderName: string, pathPrefix: string) => {
        if (!children[folderName]) {
            children[folderName] = {
                id: `${pathPrefix}/${folderName}`,
                name: folderName,
                type: 'folder',
                children: {},
            };
        }
        return children[folderName].children!;
    };

    Object.entries(projectModules).forEach(([path, rawContent]) => {
        const relative = path.split('../content/projects/')[1];
        if (!relative) return;

        const segments = relative.split('/');
        const fileName = segments.pop();
        if (!fileName) return;

        let currentChildren = root;
        let currentPath = 'projects';

        segments.forEach((segment) => {
            currentChildren = ensureFolder(currentChildren, segment, currentPath);
            currentPath += `/${segment}`;
        });

        currentChildren[fileName] = {
            id: `${currentPath}/${fileName}`,
            name: fileName,
            type: 'file',
            icon: defaultTextIcon,
            content: rawContent,
        };
    });

    return root;
})();

export const initialFileSystem: Record<string, FileSystemItem> = {
    'My Computer': {
        id: 'my-computer',
        name: 'My Computer',
        type: 'system',
        children: {
            'C:': {
                id: 'c-drive',
                name: 'Local Disk (C:)',
                type: 'drive',
                size: 'Free Space: 20GB',
                children: {
                    'Documents and Settings': {
                        id: 'docs-settings',
                        name: 'Documents and Settings',
                        type: 'folder',
                        children: {
                            'C4m1r': {
                                id: 'user-c4m1r',
                                name: 'C4m1r',
                                type: 'folder',
                                children: {
                                    'Desktop': {
                                        id: 'desktop',
                                        name: 'Desktop',
                                        type: 'folder',
                                        children: {}
                                    },
                                    'My Documents': {
                                        id: 'my-documents',
                                        name: 'Мои документы',
                                        type: 'folder',
                                        icon: documentsFolderIcon,
                                        children: {
                                            'My Music': { id: 'my-music', name: 'Моя музыка', type: 'folder', icon: folderIcon, children: {} },
                                            'My Videos': { id: 'my-videos', name: 'Мои видеозаписи', type: 'folder', icon: folderIcon, children: videoChildren },
                                            'My Downloads': { id: 'my-downloads', name: 'Загрузки', type: 'folder', icon: folderIcon, children: {} },
                                            'My Pictures': {
                                                id: 'my-pictures',
                                                name: 'Мои рисунки',
                                                type: 'folder',
                                                icon: picturesFolderIcon,
                                                children: pictureChildren
                                            },
                                            'Вики': { id: 'shortcut-wiki', name: 'Вики', type: 'file', appId: 'wiki', icon: defaultTextIcon },
                                            'Мой блок': { id: 'shortcut-notepad', name: 'Мой блок', type: 'file', appId: 'notepad', icon: defaultTextIcon },
                                            'Обо мне': { id: 'shortcut-about', name: 'Обо мне', type: 'file', appId: 'about', icon: userIcon },
                                            'Мои проекты': {
                                                id: 'my-projects',
                                                name: 'Мои проекты',
                                                type: 'folder',
                                                icon: folderIcon,
                                                children: {
                                                    ...projectChildren,
                                                    'Открыть проекты': { id: 'shortcut-projects-grid', name: 'Открыть проекты', type: 'file', appId: 'projects-grid', icon: defaultTextIcon }
                                                }
                                            }
                                        }
                                    },
                                    'Start Menu': {
                                        id: 'start-menu',
                                        name: 'Start Menu',
                                        type: 'folder',
                                        children: {}
                                    }
                                }
                            },
                            'All Users': {
                                id: 'all-users',
                                name: 'All Users',
                                type: 'folder',
                                children: {}
                            }
                        }
                    },
                    'Program Files': {
                        id: 'program-files',
                        name: 'Program Files',
                        type: 'folder',
                        children: {
                            'Games': {
                                id: 'games-folder',
                                name: 'Игры',
                                type: 'folder',
                                icon: gamesFolderIcon,
                                children: {
                                    'DOOM': { id: 'games-doom1', name: 'DOOM (1993)', type: 'file', appId: 'doom1', icon: defaultTextIcon },
                                    'DOOM II': { id: 'games-doom2', name: 'DOOM II', type: 'file', appId: 'doom2', icon: defaultTextIcon },
                                    'Minesweeper': { id: 'games-minesweeper', name: 'Сапёр', type: 'file', appId: 'minesweeper', icon: defaultTextIcon },
                                    'Snake': { id: 'games-snake', name: 'Змейка', type: 'file', appId: 'snake', icon: defaultTextIcon },
                                    'Memory': { id: 'games-memory', name: 'Память', type: 'file', appId: 'memory', icon: defaultTextIcon }
                                }
                            },
                            'Programs': {
                                id: 'programs-folder',
                                name: 'Программы',
                                type: 'folder',
                                icon: folderIcon,
                                children: {
                                    'Internet Explorer': { id: 'program-internet-explorer', name: 'Internet Explorer', type: 'file', appId: 'internet-explorer', icon: defaultTextIcon },
                                    'Outlook Express': { id: 'program-outlook', name: 'Outlook Express', type: 'file', appId: 'outlook', icon: defaultTextIcon },
                                    'Windows Media Player': { id: 'program-wmp', name: 'Windows Media Player', type: 'file', appId: 'windows-media-player', icon: defaultTextIcon },
                                    'Winamp': { id: 'program-winamp', name: 'Winamp', type: 'file', appId: 'winamp', icon: defaultTextIcon },
                                    'Paint': { id: 'program-paint', name: 'Paint', type: 'file', appId: 'paint', icon: defaultTextIcon },
                                    'Просмотр изображений': { id: 'program-picture-viewer', name: 'Просмотр изображений', type: 'file', appId: 'pictures', icon: defaultTextIcon },
                                    'Календарь': { id: 'program-calendar', name: 'Календарь', type: 'file', appId: 'calendar', icon: defaultTextIcon },
                                    'Лента новостей RSS': { id: 'program-news', name: 'Лента новостей RSS', type: 'file', appId: 'news', icon: defaultTextIcon },
                                    'Курсы валют': { id: 'program-currency', name: 'Курсы валют', type: 'file', appId: 'currency', icon: defaultTextIcon },
                                    'Вики': { id: 'program-wiki', name: 'Вики', type: 'file', appId: 'wiki', icon: defaultTextIcon },
                                    'Блокнот': { id: 'program-notepad', name: 'Блокнот', type: 'file', appId: 'notepad', icon: defaultTextIcon },
                                    'Мои проекты': { id: 'program-projects', name: 'Мои проекты', type: 'file', appId: 'projects-grid', icon: defaultTextIcon },
                                    'Справка и поддержка': { id: 'program-help', name: 'Справка и поддержка', type: 'file', appId: 'help', icon: defaultTextIcon },
                                    'Диспетчер задач': { id: 'program-task-manager', name: 'Диспетчер задач', type: 'file', appId: 'task-manager', icon: defaultTextIcon },
                                    'Калькулятор': { id: 'program-calculator', name: 'Калькулятор', type: 'file', appId: 'calculator', icon: defaultTextIcon },
                                    'Панель управления': { id: 'program-control-panel', name: 'Панель управления', type: 'file', appId: 'control-panel', icon: defaultTextIcon },
                                    'Терминал': { id: 'program-terminal', name: 'Терминал', type: 'file', appId: 'terminal', icon: defaultTextIcon },
                                    'Блог': { id: 'program-blog', name: 'Блог', type: 'file', appId: 'blog', icon: defaultTextIcon },
                                    'loops': { id: 'program-loops', name: 'loops', type: 'file', appId: 'loops', icon: defaultTextIcon }
                                }
                            }
                        }
                    },
                    'WINDOWS': {
                        id: 'windows',
                        name: 'WINDOWS',
                        type: 'folder',
                        children: {}
                    }
                }
            }
        }
    }
};

const isComputerRootPath = (path: string) =>
    ['my computer', 'computer', 'this pc', 'компьютер', 'мой компьютер'].includes(path.trim().toLocaleLowerCase());

export const getFileSystemItemFromPath = (path: string): FileSystemItem | null => {
    if (isComputerRootPath(path)) return initialFileSystem['My Computer'];

    const normalizedPath = path
        .trim()
        .replace(/^Local Disk \(C:\)$/i, 'C:')
        .replace(/[\\/]+/g, '/')
        .replace(/\/+$/g, '');
    const parts = normalizedPath.split('/').filter(Boolean);
    if (parts.length > 0 && isComputerRootPath(parts[0])) parts.shift();

    let current: FileSystemItem = initialFileSystem['My Computer'];
    for (const part of parts) {
        const children = current.children;
        if (!children) return null;
        const key = Object.keys(children).find((candidate) => candidate.toLocaleLowerCase() === part.toLocaleLowerCase());
        const match = key ? children[key] : Object.values(children).find((child) => child.name.toLocaleLowerCase() === part.toLocaleLowerCase());
        if (!match) return null;
        current = match;
    }
    return current;
};

export const getItemsFromPath = (path: string): FileSystemItem[] => {
    const node = getFileSystemItemFromPath(path);
    return node?.children ? Object.values(node.children) : [];
};

export const getFileIcon = (item: FileSystemItem) => {
    if (item.icon && typeof item.icon === 'string') return item.icon;
    if (item.type === 'folder') return folderIcon;
    if (item.name.endsWith('.txt') || item.name.endsWith('.md')) {
        return defaultTextIcon;
    }
    return folderIcon; // Fallback
};

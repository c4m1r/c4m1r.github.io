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
                                    },
                                    'Recent': {
                                        id: 'recent-documents',
                                        name: 'Recent',
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
                            'id Software': {
                                id: 'games-id-software',
                                name: 'id Software',
                                type: 'folder',
                                children: {
                                    'DOOM': { id: 'games-doom1', name: 'DOOM (1993)', type: 'file', appId: 'doom1', icon: defaultTextIcon },
                                    'DOOM II': { id: 'games-doom2', name: 'DOOM II', type: 'file', appId: 'doom2', icon: defaultTextIcon }
                                }
                            },
                            'Microsoft': {
                                id: 'games-microsoft',
                                name: 'Microsoft',
                                type: 'folder',
                                children: {
                                    'Minesweeper': { id: 'games-minesweeper', name: 'Сапёр', type: 'file', appId: 'minesweeper', icon: defaultTextIcon }
                                }
                            },
                            'C4m1r': {
                                id: 'games-c4m1r',
                                name: 'C4m1r',
                                type: 'folder',
                                children: {
                                    'Snake': { id: 'games-snake', name: 'Змейка', type: 'file', appId: 'snake', icon: defaultTextIcon },
                                    'Memory': { id: 'games-memory', name: 'Память', type: 'file', appId: 'memory', icon: defaultTextIcon }
                                }
                            }
                        }
                    },
                    'Programs': {
                        id: 'programs-folder',
                        name: 'Программы',
                        type: 'folder',
                        icon: folderIcon,
                        children: {
                            'Microsoft Corporation': {
                                id: 'programs-microsoft',
                                name: 'Microsoft Corporation',
                                type: 'folder',
                                children: {
                                    'Internet Explorer': { id: 'program-internet-explorer', name: 'Internet Explorer', type: 'file', appId: 'internet-explorer', icon: defaultTextIcon },
                                    'Outlook Express': { id: 'program-outlook', name: 'Outlook Express', type: 'file', appId: 'outlook', icon: defaultTextIcon },
                                    'Windows Media Player': { id: 'program-wmp', name: 'Windows Media Player', type: 'file', appId: 'windows-media-player', icon: defaultTextIcon },
                                    'Paint': { id: 'program-paint', name: 'Paint', type: 'file', appId: 'paint', icon: defaultTextIcon },
                                    'Picture Viewer': { id: 'program-picture-viewer', name: 'Picture Viewer', type: 'file', appId: 'pictures', icon: defaultTextIcon },
                                    'Calendar': { id: 'program-calendar', name: 'Calendar', type: 'file', appId: 'calendar', icon: defaultTextIcon },
                                    'Notepad': { id: 'program-notepad', name: 'Notepad', type: 'file', appId: 'notepad', icon: defaultTextIcon },
                                    'Calculator': { id: 'program-calculator', name: 'Calculator', type: 'file', appId: 'calculator', icon: defaultTextIcon },
                                    'Control Panel': { id: 'program-control-panel', name: 'Control Panel', type: 'file', appId: 'control-panel', icon: defaultTextIcon },
                                    'Task Manager': { id: 'program-task-manager', name: 'Task Manager', type: 'file', appId: 'task-manager', icon: defaultTextIcon },
                                    'Help and Support': { id: 'program-help', name: 'Help and Support', type: 'file', appId: 'help', icon: defaultTextIcon }
                                }
                            },
                            'Nullsoft': {
                                id: 'programs-nullsoft',
                                name: 'Nullsoft',
                                type: 'folder',
                                children: {
                                    'Winamp': { id: 'program-winamp', name: 'Winamp', type: 'file', appId: 'winamp', icon: defaultTextIcon }
                                }
                            },
                            'C4m1r': {
                                id: 'programs-c4m1r',
                                name: 'C4m1r',
                                type: 'folder',
                                children: {
                                    'News RSS Feed': { id: 'program-news', name: 'News RSS Feed', type: 'file', appId: 'news', icon: defaultTextIcon },
                                    'Market Rates': { id: 'program-currency', name: 'Market Rates', type: 'file', appId: 'currency', icon: defaultTextIcon },
                                    'Wiki': { id: 'program-wiki', name: 'Wiki', type: 'file', appId: 'wiki', icon: defaultTextIcon },
                                    'My Projects': { id: 'program-projects', name: 'My Projects', type: 'file', appId: 'projects-grid', icon: defaultTextIcon },
                                    'Help Library': { id: 'program-blog', name: 'Help Library', type: 'file', appId: 'blog', icon: defaultTextIcon },
                                    'Terminal': { id: 'program-terminal', name: 'Terminal', type: 'file', appId: 'terminal', icon: defaultTextIcon },
                                    'Loops': { id: 'program-loops', name: 'Loops', type: 'file', appId: 'loops', icon: defaultTextIcon }
                                }
                            }
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

// Windows 7/10/11 expose the same C4m1r profile through C:\\Users.
// The profile node is shared by reference: this is an alias, not duplicated data.
const cDrive = initialFileSystem['My Computer'].children?.['C:'];
const legacyProfiles = cDrive?.children?.['Documents and Settings'];
const c4m1rProfile = legacyProfiles?.children?.['C4m1r'];
if (cDrive?.children && c4m1rProfile) {
    cDrive.children['Users'] = {
        id: 'users-alias',
        name: 'Users',
        type: 'folder',
        children: { 'C4m1r': c4m1rProfile },
    };
}

const isComputerRootPath = (path: string) =>
    ['my computer', 'computer', 'this pc', 'компьютер', 'мой компьютер'].includes(path.trim().toLocaleLowerCase());

export const getFileSystemItemFromPath = (path: string): FileSystemItem | null => {
    if (isComputerRootPath(path)) return initialFileSystem['My Computer'];

    const normalizedPath = path
        .trim()
        .replace(/^Local Disk \(C:\)$/i, 'C:')
        .replace(/[\\/]+/g, '/')
        .replace(/\/+$/g, '');
    const usesModernProfile = /^C:\/Users(?:\/|$)/i.test(normalizedPath);
    const compatiblePath = normalizedPath;
    const parts = compatiblePath.split('/').filter(Boolean).map((part, index) => {
        if (!usesModernProfile || index < 3) return part;
        const modernFolderAliases: Record<string, string> = {
            documents: 'My Documents',
            pictures: 'My Pictures',
            music: 'My Music',
            videos: 'My Videos',
            downloads: 'My Downloads',
        };
        return modernFolderAliases[part.toLocaleLowerCase()] ?? part;
    });
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

const APP_ICON_KEYS: Record<string, keyof typeof WINXP_ASSETS> = {
    'internet-explorer': 'internetExplorerIcon',
    outlook: 'mailIcon',
    'windows-media-player': 'mediaPlayerIcon',
    winamp: 'mediaPlayerIcon',
    paint: 'paintIcon',
    pictures: 'projectsIcon',
    calendar: 'notepadIcon',
    news: 'richTextIcon',
    currency: 'calculatorIcon',
    wiki: 'richTextIcon',
    notepad: 'notepadIcon',
    'projects-grid': 'projectsIcon',
    help: 'richTextIcon',
    'task-manager': 'controlPanelIcon',
    calculator: 'calculatorIcon',
    'control-panel': 'controlPanelIcon',
    terminal: 'notepadIcon',
    blog: 'richTextIcon',
    loops: 'mediaPlayerIcon',
    minesweeper: 'minesweeperIcon',
    snake: 'gamesIcon',
    memory: 'gamesIcon',
    doom1: 'gamesIcon',
    doom2: 'gamesIcon',
};

export const getFileIcon = (item: FileSystemItem) => {
    if (item.appId) {
        const iconKey = APP_ICON_KEYS[item.appId];
        const appIcon = iconKey ? WINXP_ASSETS[iconKey] : undefined;
        if (typeof appIcon === 'string') return appIcon;
    }
    if (item.icon && typeof item.icon === 'string') return item.icon;
    if (item.type === 'folder') return folderIcon;
    if (item.name.endsWith('.txt') || item.name.endsWith('.md')) return defaultTextIcon;
    return folderIcon;
};

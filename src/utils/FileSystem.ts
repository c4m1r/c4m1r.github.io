import React from 'react';
import folderIcon from '../themes/winxp/assets/icons/folder_plain.png';
import textIcon from '../themes/winxp/assets/icons/doc.png';
import { WINXP_ASSETS } from '../themes/winxp/themeAssets';
import userIcon from '../themes/winxp/assets/user.gif';
import documentsFolderIcon from '../themes/winxp/assets/icons/folder-documents.png';
import picturesFolderIcon from '../themes/winxp/assets/icons/folder-pictures.png';
import pictureViewerIcon from '../themes/winxp/assets/icons/Windows Picture and Fax Viewer.png';
import gamesFolderIcon from '../themes/winxp/assets/icons/My Games.png';
import doomGameIcon from '../apps/doom/assets/doom-icon-32.png';
import snakeGameIcon from '../apps/games/assets/snake-icon.svg';
import memoryGameIcon from '../apps/games/assets/memory-icon.svg';
import { PROJECT_PLAYLIST } from '../apps/mediaplayer/playlist';
import winampIcon from '../themes/winxp/assets/icons/winamp.png';
import dateTimeIcon from '../themes/winxp/assets/icons/Date and Time.png';
import terminalIcon from '../themes/winxp/assets/icons/cmd.png';
import helpIcon from '../themes/winxp/assets/icons/help.png';
import performanceMonitorIcon from '../themes/winxp/assets/icons/Performance Monitor.png';
import rssNewsIcon from '../assets/icons/rss-icon.svg';
import currencyDollarIcon from '../assets/icons/currency-dollar-icon.svg';

export interface FileSystemItem {
    id: string;
    name: string;
    type: 'folder' | 'file' | 'drive' | 'system';
    icon?: string | React.ReactNode;
    content?: string;
    children?: Record<string, FileSystemItem>;
    size?: string;
    appId?: string;
    targetPath?: string;
    mediaTrackId?: string;
}

const defaultTextIcon = WINXP_ASSETS.richTextIcon ?? WINXP_ASSETS.notepadIcon ?? textIcon;

type FileSystemChildren = Record<string, FileSystemItem>;

const projectModules = import.meta.glob('../content/projects/*.md', {
    query: '?raw',
    import: 'default',
}) as Record<string, () => Promise<string>>;

const aboutProjectModules = import.meta.glob('../content/about/projects/**/*.md', {
    query: '?raw',
    import: 'default',
}) as Record<string, () => Promise<string>>;

const videoModules = import.meta.glob('../content/videos/**/*.{mp4,webm,mov,m4v}', {
    query: '?url',
    import: 'default',
    eager: true,
}) as Record<string, string>;

const musicChildren: FileSystemChildren = PROJECT_PLAYLIST.reduce((children, track) => {
    const baseName = `${track.artist} - ${track.title}`.replace(/[\\/:*?"<>|]/g, '-').trim();
    const fileName = children[`${baseName}.mp3`]
        ? `${baseName} (${track.id.slice(0, 6)}).mp3`
        : `${baseName}.mp3`;
    children[fileName] = {
        id: `music:${track.id}`,
        name: fileName,
        type: 'file',
        icon: winampIcon,
        content: track.src,
        mediaTrackId: track.id,
    };
    return children;
}, {} as FileSystemChildren);

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
    const seenProjectIds = new Set<string>();

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

    // Keep the same source precedence and filename-ID deduplication as loadAllProjects(),
    // but defer Markdown loading until the user opens a project article.
    const entries = [
        ...Object.keys(projectModules).map((path) => ({ path, source: 'standard' as const })),
        ...Object.keys(aboutProjectModules).map((path) => ({ path, source: 'about' as const })),
    ].sort((a, b) => {
        if (a.source !== b.source) return a.source === 'standard' ? -1 : 1;
        return a.path.localeCompare(b.path);
    });

    entries.forEach(({ path, source }) => {
        const relative = source === 'standard'
            ? path.split('../content/projects/')[1]
            : path.split('../content/about/projects/')[1];
        if (!relative) return;

        const segments = relative.split('/');
        const fileName = segments.pop();
        if (!fileName) return;

        const projectId = fileName.replace(/\.md$/i, '');
        const dedupeKey = projectId.toLocaleLowerCase();
        if (seenProjectIds.has(dedupeKey)) return;
        seenProjectIds.add(dedupeKey);

        let currentChildren = root;
        let currentPath = source === 'standard' ? 'projects' : 'about-projects';
        if (source === 'about') {
            segments.forEach((segment) => {
                currentChildren = ensureFolder(currentChildren, segment, currentPath);
                currentPath += `/${segment}`;
            });
        }

        const displayName = `${projectId}.md`;
        currentChildren[displayName] = {
            id: `project:${projectId}`,
            name: displayName,
            type: 'file',
            icon: defaultTextIcon,
            content: source === 'standard'
                ? `projects/${relative}`
                : `about/projects/${relative}`,
        };
    });

    return root;
})();;

export const initialFileSystem: Record<string, FileSystemItem> = {
    'My Computer': {
        id: 'my-computer',
        name: 'My Computer',
        type: 'system',
        children: {
            'Network Neighborhood': {
                id: 'network-neighborhood',
                name: 'Network Neighborhood',
                type: 'folder',
                children: {
                    'Entire Network': { id: 'entire-network', name: 'Entire Network', type: 'folder', children: {} }
                }
            },
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
                                            'My Music': { id: 'my-music', name: 'Моя музыка', type: 'folder', icon: folderIcon, children: musicChildren },
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
                        // Only publisher folders, each holding its own applications named as executables.
                        children: {
                            'idtech': {
                                id: 'publisher-idtech',
                                name: 'idtech',
                                type: 'folder',
                                children: {
                                'doom.exe': { id: 'app-doom1', name: 'doom.exe', type: 'file', appId: 'doom1', icon: doomGameIcon },
                                'doom2.exe': { id: 'app-doom2', name: 'doom2.exe', type: 'file', appId: 'doom2', icon: doomGameIcon },
                                }
                            },
                            'microsoft': {
                                id: 'publisher-microsoft',
                                name: 'microsoft',
                                type: 'folder',
                                children: {
                                'winmine.exe': { id: 'app-minesweeper', name: 'winmine.exe', type: 'file', appId: 'minesweeper', icon: defaultTextIcon },
                                'iexplore.exe': { id: 'app-internet-explorer', name: 'iexplore.exe', type: 'file', appId: 'internet-explorer', icon: defaultTextIcon },
                                'msimn.exe': { id: 'app-outlook', name: 'msimn.exe', type: 'file', appId: 'outlook', icon: defaultTextIcon },
                                'wmplayer.exe': { id: 'app-windows-media-player', name: 'wmplayer.exe', type: 'file', appId: 'windows-media-player', icon: defaultTextIcon },
                                'mspaint.exe': { id: 'app-paint', name: 'mspaint.exe', type: 'file', appId: 'paint', icon: defaultTextIcon },
                                'shimgvw.exe': { id: 'app-pictures', name: 'shimgvw.exe', type: 'file', appId: 'pictures', icon: defaultTextIcon },
                                'calendar.exe': { id: 'app-calendar', name: 'calendar.exe', type: 'file', appId: 'calendar', icon: defaultTextIcon },
                                'notepad.exe': { id: 'app-notepad', name: 'notepad.exe', type: 'file', appId: 'notepad', icon: defaultTextIcon },
                                'calc.exe': { id: 'app-calculator', name: 'calc.exe', type: 'file', appId: 'calculator', icon: defaultTextIcon },
                                'control.exe': { id: 'app-control-panel', name: 'control.exe', type: 'file', appId: 'control-panel', icon: defaultTextIcon },
                                'taskmgr.exe': { id: 'app-task-manager', name: 'taskmgr.exe', type: 'file', appId: 'task-manager', icon: defaultTextIcon },
                                'hh.exe': { id: 'app-help', name: 'hh.exe', type: 'file', appId: 'help', icon: defaultTextIcon },
                                'sol.exe': { id: 'app-solitaire', name: 'sol.exe', type: 'file', appId: 'solitaire', icon: defaultTextIcon },
                                'freecell.exe': { id: 'app-freecell', name: 'freecell.exe', type: 'file', appId: 'freecell', icon: defaultTextIcon },
                                'mshearts.exe': { id: 'app-hearts', name: 'mshearts.exe', type: 'file', appId: 'hearts', icon: defaultTextIcon },
                                'spider.exe': { id: 'app-spider', name: 'spider.exe', type: 'file', appId: 'spider', icon: defaultTextIcon },
                                'pinball.exe': { id: 'app-pinball', name: 'pinball.exe', type: 'file', appId: 'pinball', icon: defaultTextIcon },
                                }
                            },
                            'nullsoft': {
                                id: 'publisher-nullsoft',
                                name: 'nullsoft',
                                type: 'folder',
                                children: {
                                'winamp.exe': { id: 'app-winamp', name: 'winamp.exe', type: 'file', appId: 'winamp', icon: defaultTextIcon },
                                }
                            },
                            'c4m1r': {
                                id: 'publisher-c4m1r',
                                name: 'c4m1r',
                                type: 'folder',
                                children: {
                                'snake.exe': { id: 'app-snake', name: 'snake.exe', type: 'file', appId: 'snake', icon: defaultTextIcon },
                                'memory.exe': { id: 'app-memory', name: 'memory.exe', type: 'file', appId: 'memory', icon: defaultTextIcon },
                                'news.exe': { id: 'app-news', name: 'news.exe', type: 'file', appId: 'news', icon: defaultTextIcon },
                                'market-rates.exe': { id: 'app-currency', name: 'market-rates.exe', type: 'file', appId: 'currency', icon: defaultTextIcon },
                                'wiki.exe': { id: 'app-wiki', name: 'wiki.exe', type: 'file', appId: 'wiki', icon: defaultTextIcon },
                                'projects.exe': { id: 'app-projects-grid', name: 'projects.exe', type: 'file', appId: 'projects-grid', icon: defaultTextIcon },
                                'help-library.exe': { id: 'app-blog', name: 'help-library.exe', type: 'file', appId: 'blog', icon: defaultTextIcon },
                                'terminal.exe': { id: 'app-terminal', name: 'terminal.exe', type: 'file', appId: 'terminal', icon: defaultTextIcon },
                                'loops.exe': { id: 'app-loops', name: 'loops.exe', type: 'file', appId: 'loops', icon: defaultTextIcon },
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
if (cDrive?.children && c4m1rProfile && legacyProfiles?.children) {
    const userProfile: FileSystemItem = {
        id: 'user-user',
        name: 'User',
        type: 'folder',
        children: {
            'Desktop': { id: 'desktop-user', name: 'Desktop', type: 'folder', children: {} },
            'My Documents': {
                id: 'my-documents-user',
                name: 'Мои документы',
                type: 'folder',
                icon: documentsFolderIcon,
                children: {
                    'My Music': { id: 'my-music-user', name: 'Моя музыка', type: 'folder', icon: folderIcon, children: musicChildren },
                    'My Videos': { id: 'my-videos-user', name: 'Мои видеозаписи', type: 'folder', icon: folderIcon, children: videoChildren },
                    'My Downloads': { id: 'my-downloads-user', name: 'Загрузки', type: 'folder', icon: folderIcon, children: {} },
                    'My Pictures': { id: 'my-pictures-user', name: 'Мои рисунки', type: 'folder', icon: picturesFolderIcon, children: pictureChildren },
                    'Мои проекты': { id: 'my-projects-user', name: 'Мои проекты', type: 'folder', icon: folderIcon, children: { ...projectChildren } },
                },
            },
            'Start Menu': { id: 'start-menu-user', name: 'Start Menu', type: 'folder', children: {} },
            'Recent': { id: 'recent-user', name: 'Recent', type: 'folder', children: {} },
        },
    };
    legacyProfiles.children['User'] = userProfile;
    cDrive.children['Users'] = {
        id: 'users-alias',
        name: 'Users',
        type: 'folder',
        children: { 'C4m1r': c4m1rProfile, 'User': userProfile },
    };
    const desktop = c4m1rProfile.children?.['Desktop'];
    // Games and Programs on the desktop hold flat shortcuts to the executables in
    // Program Files, with no nested folders.
    const gameAppIds = new Set(['doom1', 'doom2', 'minesweeper', 'solitaire', 'freecell', 'hearts', 'spider', 'pinball', 'snake', 'memory']);
    const programFiles = cDrive.children?.['Program Files'];
    const collectShortcuts = (predicate: (appId: string) => boolean): Record<string, FileSystemItem> => {
        const found: FileSystemItem[] = [];
        const walk = (folder?: FileSystemItem) => {
            Object.values(folder?.children ?? {}).forEach((entry) => {
                if (entry.type === 'folder') walk(entry);
                else if (entry.appId && predicate(entry.appId)) found.push(entry);
            });
        };
        walk(programFiles);
        return Object.fromEntries(found.map((entry) => [entry.name, entry]));
    };
    const gameShortcuts = collectShortcuts((appId) => gameAppIds.has(appId));
    const programShortcuts = collectShortcuts((appId) => !gameAppIds.has(appId));

    if (desktop?.children) {
        desktop.children['Игры'] = {
            id: 'desktop-games-shortcut',
            name: 'Игры',
            type: 'folder',
            icon: gamesFolderIcon,
            children: gameShortcuts,
        };
        desktop.children['Программы'] = {
            id: 'desktop-programs-shortcut',
            name: 'Программы',
            type: 'folder',
            icon: folderIcon,
            children: programShortcuts,
        };
    }
}

const isComputerRootPath = (path: string) =>
    ['my computer', 'computer', 'this pc', 'компьютер', 'мой компьютер'].includes(path.trim().toLocaleLowerCase());

export async function loadProjectMarkdown(path: string): Promise<string> {
    const normalized = path.trim().split('\\').join('/').replace(/^\/+/, '');
    if (!normalized.startsWith('projects/') && !normalized.startsWith('about/projects/')) {
        throw new Error(`Unsupported project article path: ${path}`);
    }
    const moduleKey = `../content/${normalized}`;
    const loader = projectModules[moduleKey] ?? aboutProjectModules[moduleKey];
    if (!loader) throw new Error(`Project article not found: ${path}`);
    return loader();
}

export const getFileSystemItemFromPath = (path: string): FileSystemItem | null => {
    if (isComputerRootPath(path)) return initialFileSystem['My Computer'];
    if (['network neighborhood', 'сетевое окружение', 'my network places'].includes(path.trim().toLocaleLowerCase())) {
        return initialFileSystem['My Computer'].children?.['Network Neighborhood'] ?? null;
    }

    const normalizedPath = path
        .trim()
        .replace(/^Local Disk \(C:\)$/i, 'C:')
        .replace(/[\\/]+/g, '/')
        .replace(/\/+$/g, '');
    const usesModernProfile = /^C:\/Users(?:\/|$)/i.test(normalizedPath);
    const parts = normalizedPath.split('/').filter(Boolean);
    if (usesModernProfile && parts.length >= 4) {
        const modernFolderAliases: Record<string, string[]> = {
            documents: ['My Documents'],
            pictures: ['My Documents', 'My Pictures'],
            music: ['My Documents', 'My Music'],
            videos: ['My Documents', 'My Videos'],
            downloads: ['My Documents', 'My Downloads'],
        };
        const alias = modernFolderAliases[parts[3].toLocaleLowerCase()];
        if (alias) parts.splice(3, 1, ...alias);
    }
    if (parts.length > 0 && isComputerRootPath(parts[0])) parts.shift();

    const resolveParts = (start: FileSystemItem, pathParts: string[]): FileSystemItem | null => {
        let current = start;
        for (const part of pathParts) {
            const children = current.children;
            if (!children) return null;
            const key = Object.keys(children).find((candidate) => candidate.toLocaleLowerCase() === part.toLocaleLowerCase());
            const match = key ? children[key] : Object.values(children).find((child) => child.name.toLocaleLowerCase() === part.toLocaleLowerCase());
            if (!match) return null;
            if (match.targetPath) {
                const targetParts = match.targetPath.replace(/[\\/]+/g, '/').split('/').filter(Boolean);
                const target = resolveParts(initialFileSystem['My Computer'], targetParts);
                if (!target) return null;
                // Keep the canonical Program Files target while showing its launchable
                // shortcuts as a flat desktop-folder view.
                current = match.children
                    ? { ...target, id: match.id, name: match.name, icon: match.icon, children: match.children }
                    : target;
            } else {
                current = match;
            }
        }
        return current;
    };
    return resolveParts(initialFileSystem['My Computer'], parts);
};

export const getItemsFromPath = (path: string): FileSystemItem[] => {
    const node = getFileSystemItemFromPath(path);
    return node?.children ? Object.values(node.children) : [];
};

const APP_ICON_URLS: Record<string, string | undefined> = {
    about: WINXP_ASSETS.userAvatar,
    'internet-explorer': WINXP_ASSETS.internetExplorerIcon,
    outlook: WINXP_ASSETS.mailIcon,
    'windows-media-player': WINXP_ASSETS.mediaPlayerIcon,
    winamp: winampIcon,
    paint: WINXP_ASSETS.paintIcon,
    pictures: pictureViewerIcon,
    calendar: dateTimeIcon,
    news: rssNewsIcon,
    currency: currencyDollarIcon,
    wiki: WINXP_ASSETS.richTextIcon,
    notepad: WINXP_ASSETS.notepadIcon,
    'projects-grid': WINXP_ASSETS.projectsIcon,
    help: helpIcon,
    'task-manager': performanceMonitorIcon,
    calculator: WINXP_ASSETS.calculatorIcon,
    'control-panel': WINXP_ASSETS.controlPanelIcon,
    terminal: terminalIcon,
    blog: WINXP_ASSETS.richTextIcon,
    loops: winampIcon,
    minesweeper: WINXP_ASSETS.minesweeperIcon,
    snake: snakeGameIcon,
    memory: memoryGameIcon,
    doom1: doomGameIcon,
    doom2: doomGameIcon,
};

export const getFileIcon = (item: FileSystemItem) => {
    if (item.appId) {
        const appIcon = APP_ICON_URLS[item.appId];
        if (typeof appIcon === 'string') return appIcon;
    }
    if (item.icon && typeof item.icon === 'string') return item.icon;
    if (item.type === 'folder') return folderIcon;
    if (item.name.endsWith('.txt') || item.name.endsWith('.md')) return defaultTextIcon;
    return folderIcon;
};

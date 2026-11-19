import React from 'react';
import folderIcon from '../themes/winxp/assets/icons/folder_plain.png';
import textIcon from '../themes/winxp/assets/icons/doc.png';
import { WINXP_ASSETS } from '../themes/winxp/themeAssets';
import userIcon from '../themes/winxp/assets/user.gif';
import documentsFolderIcon from '../themes/winxp/assets/icons/folder-documents.png';
import picturesFolderIcon from '../themes/winxp/assets/icons/folder-pictures.png';
import gamesFolderIcon from '../themes/winxp/assets/icons/My Games.png';
import doomGameIcon from '../apps/doom/assets/doom-icon-sm.webp';
import snakeGameIcon from '../apps/games/assets/snake-icon.svg';
import memoryGameIcon from '../apps/games/assets/memory-icon.svg';
import { PROJECT_PLAYLIST } from '../apps/mediaplayer/playlist';
import winampIcon from '../themes/winxp/assets/icons/winamp.png';
import { parseFrontmatter } from '../domain/content/frontmatter';

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

const projectModules = import.meta.glob('../content/projects/*.{md,txt}', {
    query: '?raw',
    import: 'default',
    eager: true,
}) as Record<string, string>;

const aboutProjectModules = import.meta.glob('../content/about/projects/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
}) as Record<string, string>;

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

    // Match loadAllProjects(): standard project files win, then about/projects
    // entries are added only when their filename ID has not appeared already.
    const entries = [
        ...Object.entries(projectModules).map(([path, content]) => ({ path, content, source: 'standard' as const })),
        ...Object.entries(aboutProjectModules).map(([path, content]) => ({ path, content, source: 'about' as const })),
    ].sort((a, b) => {
        if (a.source !== b.source) return a.source === 'standard' ? -1 : 1;
        return a.path.localeCompare(b.path);
    });

    entries.forEach(({ path, content: rawContent, source }) => {
        const relative = source === 'standard'
            ? path.split('../content/projects/')[1]
            : path.split('../content/about/projects/')[1];
        if (!relative) return;

        const segments = relative.split('/');
        const fileName = segments.pop();
        if (!fileName) return;

        const projectId = fileName.replace(/\.(md|txt)$/i, '');
        const dedupeKey = projectId.toLocaleLowerCase();
        if (seenProjectIds.has(dedupeKey)) return;
        seenProjectIds.add(dedupeKey);

        const parsed = parseFrontmatter(rawContent);
        const title = String(parsed.metadata.title || projectId).trim();
        const displayName = `${title.replace(/\.(md|txt)$/i, '')}.md`;
        let currentChildren = root;
        let currentPath = source === 'standard' ? 'projects' : 'about-projects';

        if (source === 'about') {
            segments.forEach((segment) => {
                currentChildren = ensureFolder(currentChildren, segment, currentPath);
                currentPath += `/${segment}`;
            });
        }

        currentChildren[displayName] = {
            id: `project:${projectId}`,
            name: displayName,
            type: 'file',
            icon: defaultTextIcon,
            content: parsed.body,
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
    if (desktop?.children) {
        desktop.children['Игры'] = {
            id: 'desktop-games-shortcut',
            name: 'Игры',
            type: 'folder',
            icon: gamesFolderIcon,
            targetPath: 'C:\\Program Files\\Games',
        };
        desktop.children['Программы'] = {
            id: 'desktop-programs-shortcut',
            name: 'Программы',
            type: 'folder',
            icon: folderIcon,
            targetPath: 'C:\\Program Files\\Programs',
        };
    }
}

const isComputerRootPath = (path: string) =>
    ['my computer', 'computer', 'this pc', 'компьютер', 'мой компьютер'].includes(path.trim().toLocaleLowerCase());

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
                current = target;
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
    'internet-explorer': WINXP_ASSETS.internetExplorerIcon,
    outlook: WINXP_ASSETS.mailIcon,
    'windows-media-player': WINXP_ASSETS.mediaPlayerIcon,
    winamp: winampIcon,
    paint: WINXP_ASSETS.paintIcon,
    pictures: WINXP_ASSETS.projectsIcon,
    calendar: WINXP_ASSETS.notepadIcon,
    news: WINXP_ASSETS.richTextIcon,
    currency: WINXP_ASSETS.calculatorIcon,
    wiki: WINXP_ASSETS.richTextIcon,
    notepad: WINXP_ASSETS.notepadIcon,
    'projects-grid': WINXP_ASSETS.projectsIcon,
    help: WINXP_ASSETS.richTextIcon,
    'task-manager': WINXP_ASSETS.controlPanelIcon,
    calculator: WINXP_ASSETS.calculatorIcon,
    'control-panel': WINXP_ASSETS.controlPanelIcon,
    terminal: WINXP_ASSETS.notepadIcon,
    blog: WINXP_ASSETS.richTextIcon,
    loops: WINXP_ASSETS.mediaPlayerIcon,
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

import React from 'react';
import folderIcon from '../themes/winxp/assets/icons/folder_plain.png';
import textIcon from '../themes/winxp/assets/icons/doc.png';
import { WINXP_ASSETS } from '../themes/winxp/themeAssets';
import userIcon from '../themes/winxp/assets/user.gif';
import documentsFolderIcon from '../themes/winxp/assets/icons/folder-documents.png';
import picturesFolderIcon from '../themes/winxp/assets/icons/folder-pictures.png';
import gamesFolderIcon from '../themes/winxp/assets/icons/folder_program.png';

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

const blogModules = import.meta.glob('../content/blog/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
}) as Record<string, string>;

const projectModules = import.meta.glob('../content/projects/**/*.{md,txt}', {
    query: '?raw',
    import: 'default',
    eager: true,
}) as Record<string, string>;

const buildBlogChildren = (): FileSystemChildren => {
    const children: FileSystemChildren = {};
    Object.entries(blogModules).forEach(([path, rawContent]) => {
        const name = path.split('/').pop() || 'post.md';
        children[name] = {
            id: `blog-${name}`,
            name,
            type: 'file',
            icon: defaultTextIcon,
            content: rawContent,
        };
    });
    return children;
};

const blogChildren = buildBlogChildren();
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
                                        children: {
                                            'My Blog': {
                                                id: 'my-blog',
                                                name: 'My Blog',
                                                type: 'folder',
                                                icon: folderIcon,
                                                children: blogChildren
                                            },
                                            'Welcome.txt': {
                                                id: 'welcome',
                                                name: 'Welcome.txt',
                                                type: 'file',
                                                icon: defaultTextIcon,
                                                content: 'about/welcome.md'
                                            }
                                        }
                                    },
                                    'My Documents': {
                                        id: 'my-documents',
                                        name: 'Мои документы',
                                        type: 'folder',
                                        icon: documentsFolderIcon,
                                        children: {
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
                                    'My Pictures': {
                                        id: 'my-pictures',
                                        name: 'Мои изображения',
                                        type: 'folder',
                                        icon: picturesFolderIcon,
                                        children: pictureChildren
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
                                    'DOOM 3': { id: 'games-doom3', name: 'DOOM 3', type: 'file', appId: 'doom3', icon: defaultTextIcon },
                                    'Minesweeper': { id: 'games-minesweeper', name: 'Сапёр', type: 'file', appId: 'minesweeper', icon: defaultTextIcon },
                                    'Snake': { id: 'games-snake', name: 'Змейка', type: 'file', appId: 'snake', icon: defaultTextIcon },
                                    'Memory': { id: 'games-memory', name: 'Память', type: 'file', appId: 'memory', icon: defaultTextIcon }
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

export const getItemsFromPath = (path: string): FileSystemItem[] => {
    if (path === 'My Computer') {
        return Object.values(initialFileSystem['My Computer'].children || {});
    }

    // Handle C:\ path normalization
    const normalizedPath = path.replace('Local Disk (C:)', 'C:').replace(/\\/g, '/');
    const parts = normalizedPath.split('/').filter(p => p);

    let current = initialFileSystem['My Computer'];

    // Navigate through parts
    for (const part of parts) {
        if (current.children && current.children[part]) {
            current = current.children[part];
        } else {
            // Try finding by name if key doesn't match exactly (though keys should match names in this simple setup)
            const found = Object.values(current.children || {}).find(c => c.name === part);
            if (found) {
                current = found;
            } else {
                return [];
            }
        }
    }

    return current.children ? Object.values(current.children) : [];
};

export const getFileIcon = (item: FileSystemItem) => {
    if (item.icon && typeof item.icon === 'string') return item.icon;
    if (item.type === 'folder') return folderIcon;
    if (item.name.endsWith('.txt') || item.name.endsWith('.md')) {
        return defaultTextIcon;
    }
    return folderIcon; // Fallback
};

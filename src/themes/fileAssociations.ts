import type { ThemeAssets } from './webos/themeAssets';

export type FileAssociationCategory =
  | 'text'
  | 'document'
  | 'image'
  | 'audio'
  | 'video'
  | 'archive'
  | 'font'
  | 'code'
  | 'data'
  | 'unknown';

export interface FileAssociation {
  extensions: readonly string[];
  category: FileAssociationCategory;
  mimeType: string;
  /** Existing shared app ID, when the project has a suitable viewer/player. */
  defaultAppId?: string;
  /** Semantic role resolved against the active OS theme. */
  iconAsset: keyof ThemeAssets;
}

const associations: readonly FileAssociation[] = [
  { extensions: ['txt', 'log', 'ini', 'cfg', 'conf', 'md', 'markdown', 'rtf'], category: 'text', mimeType: 'text/plain', defaultAppId: 'notepad', iconAsset: 'notepadIcon' },
  { extensions: ['html', 'htm', 'xhtml'], category: 'document', mimeType: 'text/html', defaultAppId: 'internet-explorer', iconAsset: 'internetExplorerIcon' },
  { extensions: ['pdf'], category: 'document', mimeType: 'application/pdf', iconAsset: 'richTextIcon' },
  { extensions: ['doc', 'docx', 'odt', 'pages'], category: 'document', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', iconAsset: 'richTextIcon' },
  { extensions: ['xls', 'xlsx', 'ods', 'csv'], category: 'data', mimeType: 'text/csv', iconAsset: 'richTextIcon' },
  { extensions: ['ppt', 'pptx', 'odp', 'key'], category: 'document', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', iconAsset: 'richTextIcon' },
  { extensions: ['xml', 'json', 'yaml', 'yml', 'toml'], category: 'data', mimeType: 'application/json', defaultAppId: 'notepad', iconAsset: 'notepadIcon' },
  { extensions: ['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'css', 'scss', 'sass', 'less', 'vue', 'svelte', 'py', 'rb', 'php', 'java', 'kt', 'swift', 'c', 'h', 'cpp', 'hpp', 'cs', 'go', 'rs', 'sh', 'bash', 'zsh', 'sql', 'graphql', 'dockerfile', 'makefile'], category: 'code', mimeType: 'text/plain', defaultAppId: 'notepad', iconAsset: 'notepadIcon' },
  { extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tif', 'tiff', 'svg', 'avif', 'heic', 'ico'], category: 'image', mimeType: 'image/*', defaultAppId: 'pictures', iconAsset: 'picturesIcon' },
  { extensions: ['mp3', 'wav', 'ogg', 'oga', 'opus', 'flac', 'm4a', 'aac', 'wma', 'mid', 'midi'], category: 'audio', mimeType: 'audio/*', defaultAppId: 'windows-media-player', iconAsset: 'winampIcon' },
  { extensions: ['mp4', 'm4v', 'webm', 'mov', 'avi', 'mkv', 'mpeg', 'mpg', 'wmv', '3gp'], category: 'video', mimeType: 'video/*', defaultAppId: 'windows-media-player', iconAsset: 'mediaPlayerIcon' },
  { extensions: ['zip', '7z', 'rar', 'tar', 'gz', 'bz2', 'xz', 'zst', 'tgz', 'cab', 'iso', 'dmg'], category: 'archive', mimeType: 'application/octet-stream', iconAsset: 'richTextIcon' },
  { extensions: ['ttf', 'otf', 'woff', 'woff2'], category: 'font', mimeType: 'font/*', iconAsset: 'richTextIcon' },
];

const byExtension = new Map<string, FileAssociation>();
for (const association of associations) {
  for (const extension of association.extensions) byExtension.set(extension, association);
}

export const FILE_ASSOCIATIONS = associations;

export function getFileAssociation(fileName: string): FileAssociation | undefined {
  const cleanName = fileName.split(/[?#]/, 1)[0] ?? fileName;
  const extension = cleanName.split('.').pop()?.toLocaleLowerCase();
  if (!extension || extension === cleanName.toLocaleLowerCase()) return undefined;
  return byExtension.get(extension);
}

import { type BootMenuGroup, type OsBootProfile, type OsProfileId } from './osTypes';

/**
 * Boot menu entries. `order` sorts entries inside their group. Windows entries follow the
 * release-based sequence of the Windows family; server editions are drafts that reuse the
 * closest client skin until their own skin exists.
 */
function windows(
  id: OsProfileId,
  label: string,
  theme: NonNullable<OsBootProfile['theme']>,
  order: number,
  draft = false,
): OsBootProfile {
  return {
    id,
    label,
    kind: 'desktop',
    mode: 'webos',
    theme,
    order,
    enabled: true,
    group: 'windows',
    ...(draft ? { draft: true } : {}),
  };
}

export const osBootProfiles: OsBootProfile[] = [
  {
    id: 'site' as OsProfileId,
    label: 'Мой сайт',
    kind: 'site' as const,
    mode: 'blog' as const,
    order: 0,
    enabled: true,
    defaultSelected: true,
  },
  windows('win95' as OsProfileId, 'Windows 95', 'win-98', 100, true),
  windows('win-98' as OsProfileId, 'Windows 98', 'win-98', 101),
  windows('win2000' as OsProfileId, 'Windows 2000', 'win2000', 102),
  windows('server2003' as OsProfileId, 'Windows Server 2003', 'win-xp', 103, true),
  windows('win-xp' as OsProfileId, 'Windows XP', 'win-xp', 104),
  windows('vista' as OsProfileId, 'Windows Vista', 'vista', 105, true),
  windows('server2008' as OsProfileId, 'Windows Server 2008', 'vista', 106, true),
  windows('win7' as OsProfileId, 'Windows 7', 'win7', 107),
  windows('win8' as OsProfileId, 'Windows 8', 'win8', 108, true),
  windows('server2012' as OsProfileId, 'Windows Server 2012', 'win8', 109, true),
  windows('win10' as OsProfileId, 'Windows 10', 'win10', 110, true),
  windows('server2016' as OsProfileId, 'Windows Server 2016', 'win10', 111, true),
  windows('server2019' as OsProfileId, 'Windows Server 2019', 'win10', 112, true),
  windows('win11' as OsProfileId, 'Windows 11', 'win11', 113, true),
  {
    id: 'ubuntu' as OsProfileId,
    label: 'Ubuntu',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'ubuntu' as const,
    order: 20,
    enabled: true,
    group: 'unix' as BootMenuGroup,
  },
  {
    id: 'arch' as OsProfileId,
    label: 'Arch Linux',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'arch' as const,
    order: 21,
    enabled: true,
    group: 'unix' as BootMenuGroup,
  },
  {
    id: 'macos-26' as OsProfileId,
    label: 'macOS Tahoe 26',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'macos-26' as const,
    order: 300,
    enabled: true,
    group: 'macos' as BootMenuGroup,
  },
  {
    id: 'ios-26' as OsProfileId,
    label: 'iOS 26.6.1',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'ios-26' as const,
    order: 10,
    enabled: true,
    group: 'mobile' as BootMenuGroup,
  },
  {
    id: 'ios-16' as OsProfileId,
    label: 'iOS 16.7.16',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'ios-16' as const,
    order: 11,
    enabled: true,
    group: 'mobile' as BootMenuGroup,
  },
  {
    id: 'ios-9' as OsProfileId,
    label: 'iOS 9.3.6',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'ios-9' as const,
    order: 12,
    enabled: true,
    group: 'mobile' as BootMenuGroup,
  },
  {
    id: 'ios-5' as OsProfileId,
    label: 'iOS 5.1.1',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'ios-5' as const,
    order: 13,
    enabled: true,
    group: 'mobile' as BootMenuGroup,
  },
  {
    id: 'halloween' as OsProfileId,
    label: 'Halloween Edition',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'halloween' as const,
    order: 114,
    enabled: true,
    group: 'windows' as BootMenuGroup,
  },
  {
    id: 'terminal' as OsProfileId,
    label: 'Терминал',
    kind: 'terminal' as const,
    mode: 'terminal' as const,
    order: 600,
    enabled: true,
  },
  {
    id: 'webos' as OsProfileId,
    label: 'WebOS',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'webos' as const,
    order: 700,
    enabled: true,
  },
].sort((a, b) => a.order - b.order);

export const enabledOsBootProfiles: OsBootProfile[] = osBootProfiles.filter(
  (profile) => profile.enabled
);

export function getDefaultBootProfile(): OsBootProfile {
  return (
    enabledOsBootProfiles.find((profile) => profile.defaultSelected) ??
    enabledOsBootProfiles[0]
  );
}

export function findOsBootProfile(id: OsProfileId): OsBootProfile | undefined {
  return osBootProfiles.find((profile) => profile.id === id);
}

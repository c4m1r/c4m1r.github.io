import { type OsBootProfile, type OsProfileId } from './osTypes';

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
  {
    id: 'win-xp' as OsProfileId,
    label: 'Windows XP',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'win-xp' as const,
    order: 10,
    enabled: true,
  },
  {
    id: 'win-98' as OsProfileId,
    label: 'Windows 98',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'win-98' as const,
    order: 20,
    enabled: true,
  },
  {
    id: 'win7' as OsProfileId,
    label: 'Windows 7',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'win7' as const,
    order: 30,
    enabled: true,
  },
  {
    id: 'ubuntu' as OsProfileId,
    label: 'Ubuntu',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'ubuntu' as const,
    order: 40,
    enabled: true,
  },
  {
    id: 'ios-26' as OsProfileId,
    label: 'iOS 26.6.1',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'ios-26' as const,
    order: 42,
    enabled: true,
  },
  {
    id: 'ios-16' as OsProfileId,
    label: 'iOS 16.7.16',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'ios-16' as const,
    order: 44,
    enabled: true,
  },
  {
    id: 'ios-9' as OsProfileId,
    label: 'iOS 9.3.6',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'ios-9' as const,
    order: 46,
    enabled: true,
  },
  {
    id: 'ios-5' as OsProfileId,
    label: 'iOS 5.1.1',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'ios-5' as const,
    order: 48,
    enabled: true,
  },
  {
    id: 'terminal' as OsProfileId,
    label: 'Терминал',
    kind: 'terminal' as const,
    mode: 'terminal' as const,
    order: 50,
    enabled: true,
  },
  {
    id: 'webos' as OsProfileId,
    label: 'WebOS',
    kind: 'desktop' as const,
    mode: 'webos' as const,
    theme: 'webos' as const,
    order: 60,
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

/**
 * The OS profile chosen in GRUB. Windows 95 and Windows 98 share the same theme, so the boot
 * screen needs the profile id to show the right splash. Set when GRUB boots an entry.
 */
let activeBootProfileId: string | null = null;

export function setActiveBootProfileId(id: string | null): void {
  activeBootProfileId = id;
}

export function getActiveBootProfileId(): string | null {
  return activeBootProfileId;
}

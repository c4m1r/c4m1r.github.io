import bootVideo from './assets/boot/win7-boot-anim.mp4';
import welcomeLoadingVideo from './assets/boot/win7-greetings-loading.webm';
import { OS_SOUNDS } from '../../assets/os-sounds';
import loginBackground from './assets/images/login-background.jpg';
import desktopWallpaper from './assets/images/desktop-wallpaper.jpg';
import windowsLogo from './assets/images/windows-7-logo.png';
import startOrb from './assets/images/start-orb.png';
import startOrbHover from './assets/images/start-orb-hover.png';
import userAvatar from './assets/images/user-avatar.png';
import shutdownIcon from './assets/images/shutdown.png';
import volumeIcon from './assets/icons/volume.png';
import computerIcon from './assets/icons/computer.png';
import internetExplorerIcon from './assets/icons/internet-explorer.png';
import mailIcon from './assets/icons/mail.png';
import folderIcon from './assets/icons/folder.png';

export const WIN7_ASSETS = {
  bootVideo,
  welcomeLoadingVideo,
  startupSound: OS_SOUNDS.win7.startup,
  shutdownSound: OS_SOUNDS.win7.shutdown,
  logoffSound: OS_SOUNDS.win7.logoff,
  uiSounds: {
    menuOpen: OS_SOUNDS.win7['nav-start'],
    minimize: OS_SOUNDS.win7.minimize,
    restore: OS_SOUNDS.win7.restore,
    error: OS_SOUNDS.win7.error,
  },
  loginBackground,
  desktopWallpaper,
  windowsLogo,
  startOrb,
  startOrbHover,
  userAvatar,
  shutdownIcon,
  volumeIcon,
  computerIcon,
  internetExplorerIcon,
  mailIcon,
  folderIcon,
} as const;

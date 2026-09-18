import appearanceIcon from '../../../eat/macOS-Portfolio-main 2/public/img/icons/sf-icons/appearance.svg';
import networkIcon from '../../../eat/macOS-Portfolio-main 2/public/img/icons/sf-icons/network.svg';
import applicationsIcon from '../../../eat/macOS-Portfolio-main 2/public/img/icons/sf-icons/applications.svg';
import soundIcon from '../../../eat/macOS-Portfolio-main 2/public/img/icons/sf-icons/speaker.svg';
import maintenanceIcon from '../../../eat/macOS-Portfolio-main 2/public/img/icons/sf-icons/gear.svg';
import hardwareIcon from '../../../eat/macOS-Portfolio-main 2/public/img/icons/sf-icons/printer.svg';
import usersIcon from '../../../eat/macOS-Portfolio-main 2/public/img/icons/sf-icons/users.svg';
import clockIcon from '../../../eat/macOS-Portfolio-main 2/public/img/icons/sf-icons/clock.svg';
import accessibilityIcon from '../../../eat/macOS-Portfolio-main 2/public/img/icons/sf-icons/accessibility.svg';

export const APPLE_SETTINGS_CATEGORY_ICONS: Readonly<Record<string, string>> = {
  appearance: appearanceIcon,
  network: networkIcon,
  programs: applicationsIcon,
  sounds: soundIcon,
  maintenance: maintenanceIcon,
  hardware: hardwareIcon,
  'user-accounts': usersIcon,
  'date-time': clockIcon,
  accessibility: accessibilityIcon,
};

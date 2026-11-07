import appearanceIcon from '../../themes/apple/assets/sf-icons/appearance.svg';
import networkIcon from '../../themes/apple/assets/sf-icons/network.svg';
import applicationsIcon from '../../themes/apple/assets/sf-icons/applications.svg';
import soundIcon from '../../themes/apple/assets/sf-icons/speaker.svg';
import maintenanceIcon from '../../themes/apple/assets/sf-icons/gear.svg';
import hardwareIcon from '../../themes/apple/assets/sf-icons/printer.svg';
import usersIcon from '../../themes/apple/assets/sf-icons/users.svg';
import clockIcon from '../../themes/apple/assets/sf-icons/clock.svg';
import accessibilityIcon from '../../themes/apple/assets/sf-icons/accessibility.svg';

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

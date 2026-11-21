/**
 * Core original Windows system and UI sounds, one folder per OS.
 * Only the sounds an emulated OS needs for basic behaviour are kept here; rare
 * sounds (speech, alarms, media, notification variants) are not part of the store.
 */

import winxp_balloon from './winxp/balloon.wav';
import winxp_critical_stop from './winxp/critical-stop.wav';
import winxp_error from './winxp/error.wav';
import winxp_exclamation from './winxp/exclamation.wav';
import winxp_launch from './winxp/launch.wav';
import winxp_logoff from './winxp/logoff.wav';
import winxp_logon from './winxp/logon.wav';
import winxp_menu_command from './winxp/menu-command.wav';
import winxp_minimize from './winxp/minimize.wav';
import winxp_nav_start from './winxp/nav-start.wav';
import winxp_notify from './winxp/notify.wav';
import winxp_recycle from './winxp/recycle.wav';
import winxp_restore from './winxp/restore.wav';
import winxp_shutdown from './winxp/shutdown.wav';
import winxp_startup from './winxp/startup.wav';
import win7_balloon from './win7/balloon.wav';
import win7_critical_stop from './win7/critical-stop.wav';
import win7_error from './win7/error.wav';
import win7_exclamation from './win7/exclamation.wav';
import win7_logoff from './win7/logoff.wav';
import win7_logon from './win7/logon.wav';
import win7_menu_command from './win7/menu-command.wav';
import win7_minimize from './win7/minimize.wav';
import win7_nav_start from './win7/nav-start.wav';
import win7_notify from './win7/notify.wav';
import win7_recycle from './win7/recycle.wav';
import win7_restore from './win7/restore.wav';
import win7_shutdown from './win7/shutdown.wav';
import win7_startup from './win7/startup.wav';
import vista_balloon from './vista/balloon.wav';
import vista_critical_stop from './vista/critical-stop.wav';
import vista_error from './vista/error.wav';
import vista_exclamation from './vista/exclamation.wav';
import vista_logoff from './vista/logoff.wav';
import vista_logon from './vista/logon.wav';
import vista_menu_command from './vista/menu-command.wav';
import vista_minimize from './vista/minimize.wav';
import vista_nav_start from './vista/nav-start.wav';
import vista_notify from './vista/notify.wav';
import vista_recycle from './vista/recycle.wav';
import vista_restore from './vista/restore.wav';
import vista_shutdown from './vista/shutdown.wav';
import vista_startup from './vista/startup.wav';
import win10_balloon from './win10/balloon.wav';
import win10_critical_stop from './win10/critical-stop.wav';
import win10_error from './win10/error.wav';
import win10_exclamation from './win10/exclamation.wav';
import win10_logoff from './win10/logoff.wav';
import win10_logon from './win10/logon.wav';
import win10_menu_command from './win10/menu-command.wav';
import win10_minimize from './win10/minimize.wav';
import win10_nav_start from './win10/nav-start.wav';
import win10_notify from './win10/notify.wav';
import win10_recycle from './win10/recycle.wav';
import win10_restore from './win10/restore.wav';
import win10_shutdown from './win10/shutdown.wav';
import win10_startup from './win10/startup.wav';
import win11_balloon from './win11/balloon.wav';
import win11_critical_stop from './win11/critical-stop.wav';
import win11_error from './win11/error.wav';
import win11_exclamation from './win11/exclamation.wav';
import win11_logoff from './win11/logoff.wav';
import win11_logon from './win11/logon.wav';
import win11_menu_command from './win11/menu-command.wav';
import win11_minimize from './win11/minimize.wav';
import win11_nav_start from './win11/nav-start.wav';
import win11_notify from './win11/notify.wav';
import win11_recycle from './win11/recycle.wav';
import win11_restore from './win11/restore.wav';
import win11_shutdown from './win11/shutdown.wav';
import win11_startup from './win11/startup.wav';
import win2000_notify from './win2000/notify.wav';
import win2000_recycle from './win2000/recycle.wav';
import win2000_shutdown from './win2000/shutdown.wav';
import win2000_startup from './win2000/startup.wav';
import win98_logoff from './win98/logoff.wav';
import win98_notify from './win98/notify.wav';
import win98_recycle from './win98/recycle.wav';
import win98_shutdown from './win98/shutdown.wav';
import win98_startup from './win98/startup.wav';

export const OS_SOUNDS = {
  winxp: {
    'balloon': winxp_balloon,
    'critical-stop': winxp_critical_stop,
    'error': winxp_error,
    'exclamation': winxp_exclamation,
    'launch': winxp_launch,
    'logoff': winxp_logoff,
    'logon': winxp_logon,
    'menu-command': winxp_menu_command,
    'minimize': winxp_minimize,
    'nav-start': winxp_nav_start,
    'notify': winxp_notify,
    'recycle': winxp_recycle,
    'restore': winxp_restore,
    'shutdown': winxp_shutdown,
    'startup': winxp_startup,
  },
  win7: {
    'balloon': win7_balloon,
    'critical-stop': win7_critical_stop,
    'error': win7_error,
    'exclamation': win7_exclamation,
    'logoff': win7_logoff,
    'logon': win7_logon,
    'menu-command': win7_menu_command,
    'minimize': win7_minimize,
    'nav-start': win7_nav_start,
    'notify': win7_notify,
    'recycle': win7_recycle,
    'restore': win7_restore,
    'shutdown': win7_shutdown,
    'startup': win7_startup,
  },
  vista: {
    'balloon': vista_balloon,
    'critical-stop': vista_critical_stop,
    'error': vista_error,
    'exclamation': vista_exclamation,
    'logoff': vista_logoff,
    'logon': vista_logon,
    'menu-command': vista_menu_command,
    'minimize': vista_minimize,
    'nav-start': vista_nav_start,
    'notify': vista_notify,
    'recycle': vista_recycle,
    'restore': vista_restore,
    'shutdown': vista_shutdown,
    'startup': vista_startup,
  },
  win10: {
    'balloon': win10_balloon,
    'critical-stop': win10_critical_stop,
    'error': win10_error,
    'exclamation': win10_exclamation,
    'logoff': win10_logoff,
    'logon': win10_logon,
    'menu-command': win10_menu_command,
    'minimize': win10_minimize,
    'nav-start': win10_nav_start,
    'notify': win10_notify,
    'recycle': win10_recycle,
    'restore': win10_restore,
    'shutdown': win10_shutdown,
    'startup': win10_startup,
  },
  win11: {
    'balloon': win11_balloon,
    'critical-stop': win11_critical_stop,
    'error': win11_error,
    'exclamation': win11_exclamation,
    'logoff': win11_logoff,
    'logon': win11_logon,
    'menu-command': win11_menu_command,
    'minimize': win11_minimize,
    'nav-start': win11_nav_start,
    'notify': win11_notify,
    'recycle': win11_recycle,
    'restore': win11_restore,
    'shutdown': win11_shutdown,
    'startup': win11_startup,
  },
  win2000: {
    'notify': win2000_notify,
    'recycle': win2000_recycle,
    'shutdown': win2000_shutdown,
    'startup': win2000_startup,
  },
  win98: {
    'logoff': win98_logoff,
    'notify': win98_notify,
    'recycle': win98_recycle,
    'shutdown': win98_shutdown,
    'startup': win98_startup,
  },
} as const;

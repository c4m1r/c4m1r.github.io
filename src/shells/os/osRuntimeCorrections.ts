import { osSkinRules } from './osSkins';

/**
 * Small runtime fidelity corrections that intentionally override legacy config
 * without duplicating the full OS skin table.
 */
const xpStartLabels = osSkinRules['win-xp'].systemLabels?.startButton;
if (xpStartLabels) {
  // Russian Windows XP displays «Пуск» with a capital П.
  xpStartLabels.ru = 'Пуск';
}

/**
 * Classic Winamp 2.x sprite atlas metadata.
 *
 * Coordinates are ported from the MIT-licensed Webamp classic skin definitions:
 * captbaritone/webamp/packages/webamp-modern/assets/winamp_classic/xml/classic-elements.xml
 * and SkinEngine_WinampClassic.ts.
 *
 * This module is presentation-only. It never creates or touches audio state.
 */

import type { WinampSkinArchive } from './winampSkin';

export interface WinampSkinSprite {
  id: string;
  file: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const sprite = (
  id: string,
  file: string,
  x: number,
  y: number,
  width: number,
  height: number,
): WinampSkinSprite => ({ id, file, x, y, width, height });

/** Native Winamp 2.x atlas coordinates; dimensions are source pixels. */
export const WINAMP_CLASSIC_SPRITES: Readonly<Record<string, WinampSkinSprite>> = {
  main: sprite('main', 'main.bmp', 0, 0, 275, 116),
  titlebarActive: sprite('titlebarActive', 'titlebar.bmp', 27, 0, 275, 13),
  titlebarInactive: sprite('titlebarInactive', 'titlebar.bmp', 27, 15, 275, 13),
  titleMenu: sprite('titleMenu', 'titlebar.bmp', 0, 0, 9, 9),
  titleMenuPressed: sprite('titleMenuPressed', 'titlebar.bmp', 0, 9, 9, 9),
  titleMinimize: sprite('titleMinimize', 'titlebar.bmp', 9, 0, 9, 9),
  titleMinimizePressed: sprite('titleMinimizePressed', 'titlebar.bmp', 9, 9, 9, 9),
  titleClose: sprite('titleClose', 'titlebar.bmp', 18, 0, 9, 9),
  titleClosePressed: sprite('titleClosePressed', 'titlebar.bmp', 18, 9, 9, 9),
  titleShade: sprite('titleShade', 'titlebar.bmp', 0, 18, 9, 9),
  titleShadePressed: sprite('titleShadePressed', 'titlebar.bmp', 9, 18, 9, 9),
  titleSwitchOn: sprite('titleSwitchOn', 'titlebar.bmp', 0, 36, 18, 18),
  titleSwitchPressed: sprite('titleSwitchPressed', 'titlebar.bmp', 18, 36, 18, 18),

  previous: sprite('previous', 'cbuttons.bmp', 0, 0, 23, 18),
  play: sprite('play', 'cbuttons.bmp', 23, 0, 23, 18),
  pause: sprite('pause', 'cbuttons.bmp', 46, 0, 23, 18),
  stop: sprite('stop', 'cbuttons.bmp', 69, 0, 23, 18),
  next: sprite('next', 'cbuttons.bmp', 92, 0, 22, 18),
  eject: sprite('eject', 'cbuttons.bmp', 114, 0, 22, 16),
  previousPressed: sprite('previousPressed', 'cbuttons.bmp', 0, 18, 23, 18),
  playPressed: sprite('playPressed', 'cbuttons.bmp', 23, 18, 23, 18),
  pausePressed: sprite('pausePressed', 'cbuttons.bmp', 46, 18, 23, 18),
  stopPressed: sprite('stopPressed', 'cbuttons.bmp', 69, 18, 23, 18),
  nextPressed: sprite('nextPressed', 'cbuttons.bmp', 92, 18, 22, 18),
  ejectPressed: sprite('ejectPressed', 'cbuttons.bmp', 114, 16, 22, 16),

  positionTrack: sprite('positionTrack', 'posbar.bmp', 0, 0, 248, 10),
  positionThumb: sprite('positionThumb', 'posbar.bmp', 248, 0, 29, 10),
  positionThumbPressed: sprite('positionThumbPressed', 'posbar.bmp', 278, 0, 29, 10),
  volumeTrack: sprite('volumeTrack', 'volume.bmp', 0, 0, 68, 420),
  volumeThumb: sprite('volumeThumb', 'volume.bmp', 15, 422, 14, 11),
  balanceTrack: sprite('balanceTrack', 'balance.bmp', 9, 0, 38, 420),
  balanceThumb: sprite('balanceThumb', 'balance.bmp', 15, 422, 14, 11),

  repeat: sprite('repeat', 'shufrep.bmp', 0, 0, 28, 15),
  repeatPressed: sprite('repeatPressed', 'shufrep.bmp', 0, 15, 28, 15),
  repeatActive: sprite('repeatActive', 'shufrep.bmp', 0, 30, 28, 15),
  shuffle: sprite('shuffle', 'shufrep.bmp', 28, 0, 47, 15),
  shufflePressed: sprite('shufflePressed', 'shufrep.bmp', 28, 15, 47, 15),
  shuffleActive: sprite('shuffleActive', 'shufrep.bmp', 28, 30, 47, 15),
  equalizerToggleOff: sprite('equalizerToggleOff', 'shufrep.bmp', 0, 61, 23, 12),
  equalizerToggleOn: sprite('equalizerToggleOn', 'shufrep.bmp', 0, 73, 23, 12),
  playlistToggleOff: sprite('playlistToggleOff', 'shufrep.bmp', 23, 61, 23, 12),
  playlistToggleOn: sprite('playlistToggleOn', 'shufrep.bmp', 23, 73, 23, 12),

  equalizer: sprite('equalizer', 'eqmain.bmp', 0, 0, 275, 116),
  equalizerTitlebarActive: sprite('equalizerTitlebarActive', 'eqmain.bmp', 0, 134, 275, 14),
  equalizerTitlebarInactive: sprite('equalizerTitlebarInactive', 'eqmain.bmp', 0, 149, 275, 14),
  equalizerPreset: sprite('equalizerPreset', 'eqmain.bmp', 224, 164, 44, 12),
  equalizerPresetPressed: sprite('equalizerPresetPressed', 'eqmain.bmp', 224, 176, 44, 12),
  playIndicator: sprite('playIndicator', 'playpaus.bmp', 0, 0, 9, 9),
  pauseIndicator: sprite('pauseIndicator', 'playpaus.bmp', 9, 0, 9, 9),
  stopIndicator: sprite('stopIndicator', 'playpaus.bmp', 18, 0, 9, 9),
  playIndicatorGreen: sprite('playIndicatorGreen', 'playpaus.bmp', 36, 0, 3, 9),
  playIndicatorRed: sprite('playIndicatorRed', 'playpaus.bmp', 39, 0, 3, 9),
  stereoActive: sprite('stereoActive', 'monoster.bmp', 0, 0, 29, 12),
  stereoInactive: sprite('stereoInactive', 'monoster.bmp', 0, 12, 29, 12),
  monoActive: sprite('monoActive', 'monoster.bmp', 29, 0, 27, 12),
  monoInactive: sprite('monoInactive', 'monoster.bmp', 29, 12, 27, 12),

  equalizerClose: sprite('equalizerClose', 'eqmain.bmp', 0, 116, 9, 9),
  equalizerClosePressed: sprite('equalizerClosePressed', 'eqmain.bmp', 0, 125, 9, 9),
  equalizerToggle: sprite('equalizerToggle', 'eqmain.bmp', 254, 137, 9, 9),
  equalizerOff: sprite('equalizerOff', 'eqmain.bmp', 10, 119, 25, 12),
  equalizerOffPressed: sprite('equalizerOffPressed', 'eqmain.bmp', 128, 119, 25, 12),
  equalizerOn: sprite('equalizerOn', 'eqmain.bmp', 69, 119, 25, 12),
  equalizerAuto: sprite('equalizerAuto', 'eqmain.bmp', 35, 119, 33, 12),
  equalizerAutoPressed: sprite('equalizerAutoPressed', 'eqmain.bmp', 153, 119, 33, 12),
  equalizerAutoOn: sprite('equalizerAutoOn', 'eqmain.bmp', 94, 119, 33, 12),
  equalizerVisualizerBackground: sprite('equalizerVisualizerBackground', 'eqmain.bmp', 0, 294, 113, 19),

  equalizerSliderThumb: sprite('equalizerSliderThumb', 'eqmain.bmp', 0, 164, 11, 11),
  equalizerSliderThumbPressed: sprite('equalizerSliderThumbPressed', 'eqmain.bmp', 0, 176, 11, 11),
  equalizerBand0: sprite('equalizerBand0', 'eqmain.bmp', 13, 229, 14, 63),
  equalizerBand1: sprite('equalizerBand1', 'eqmain.bmp', 28, 229, 14, 63),
  equalizerBand2: sprite('equalizerBand2', 'eqmain.bmp', 43, 229, 14, 63),
  equalizerBand3: sprite('equalizerBand3', 'eqmain.bmp', 58, 229, 14, 63),
  equalizerBand4: sprite('equalizerBand4', 'eqmain.bmp', 73, 229, 14, 63),
  equalizerBand5: sprite('equalizerBand5', 'eqmain.bmp', 88, 229, 14, 63),
  equalizerBand6: sprite('equalizerBand6', 'eqmain.bmp', 103, 229, 14, 63),
  equalizerBand7: sprite('equalizerBand7', 'eqmain.bmp', 118, 229, 14, 63),
  equalizerBand8: sprite('equalizerBand8', 'eqmain.bmp', 133, 229, 14, 63),
  equalizerBand9: sprite('equalizerBand9', 'eqmain.bmp', 148, 229, 14, 63),
  equalizerPreampBand: sprite('equalizerPreampBand', 'eqmain.bmp', 163, 229, 14, 63),

  playlistTopLeft: sprite('playlistTopLeft', 'pledit.bmp', 0, 0, 25, 20),
  playlistTopCenter: sprite('playlistTopCenter', 'pledit.bmp', 26, 0, 100, 20),
  playlistTopStretch: sprite('playlistTopStretch', 'pledit.bmp', 127, 0, 25, 20),
  playlistTopRight: sprite('playlistTopRight', 'pledit.bmp', 153, 0, 25, 20),
  playlistSideLeft: sprite('playlistSideLeft', 'pledit.bmp', 0, 42, 25, 29),
  playlistSideCenter: sprite('playlistSideCenter', 'pledit.bmp', 26, 42, 25, 29),
  playlistBottomLeft: sprite('playlistBottomLeft', 'pledit.bmp', 0, 72, 125, 38),
  playlistBottomRight: sprite('playlistBottomRight', 'pledit.bmp', 126, 72, 150, 38),
  playlistClose: sprite('playlistClose', 'pledit.bmp', 167, 3, 9, 9),
  playlistClosePressed: sprite('playlistClosePressed', 'pledit.bmp', 52, 42, 9, 9),
  playlistShade: sprite('playlistShade', 'pledit.bmp', 157, 3, 9, 9),
  playlistShadePressed: sprite('playlistShadePressed', 'pledit.bmp', 62, 42, 9, 9),
};

function findSkinAsset(assets: Map<string, Blob>, fileName: string): Blob | undefined {
  const target = fileName.toLowerCase();
  let match: Blob | undefined;
  for (const [path, asset] of assets) {
    if (path.split('/').pop()?.toLowerCase() === target) match = asset;
  }
  return match;
}

/**
 * Crop one atlas entry to a standalone PNG Blob. The returned Blob owns no object URL,
 * so callers can persist it or create/revoke a URL at the UI boundary.
 */
export async function extractWinampSkinSprite(
  skin: WinampSkinArchive,
  spriteId: keyof typeof WINAMP_CLASSIC_SPRITES,
): Promise<Blob> {
  if (typeof document === 'undefined' || typeof createImageBitmap === 'undefined') {
    throw new Error('Sprite extraction requires a browser with image bitmap support');
  }

  const definition = WINAMP_CLASSIC_SPRITES[spriteId];
  const source = findSkinAsset(skin.assets, definition.file)
    ?? (spriteId === 'main' ? findSkinAsset(skin.assets, 'main.png') : undefined);
  if (!source) throw new Error(`Skin is missing required sprite sheet: ${definition.file}`);

  const bitmap = await createImageBitmap(source);
  try {
    const { x, y, width, height } = definition;
    if (x + width > bitmap.width || y + height > bitmap.height) {
      throw new Error(`Sprite "${spriteId}" is outside the bounds of ${definition.file}`);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to create a canvas context for skin extraction');
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, width, height);
    context.drawImage(bitmap, x, y, width, height, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error(`Unable to encode sprite "${spriteId}"`));
      }, 'image/png');
    });
  } finally {
    bitmap.close();
  }
}

/** Extract a named set of sprites, failing atomically if any requested crop is invalid. */
export async function extractWinampSkinSprites(
  skin: WinampSkinArchive,
  spriteIds: Array<keyof typeof WINAMP_CLASSIC_SPRITES>,
): Promise<Map<keyof typeof WINAMP_CLASSIC_SPRITES, Blob>> {
  const extracted = new Map<keyof typeof WINAMP_CLASSIC_SPRITES, Blob>();
  for (const id of spriteIds) {
    extracted.set(id, await extractWinampSkinSprite(skin, id));
  }
  return extracted;
}

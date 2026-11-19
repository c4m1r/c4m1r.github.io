import { PictureViewer } from './PictureViewer';

/** Compatibility entry point: the gallery is now a view mode of Picture Viewer. */
export function PicturesGallery() {
  return <PictureViewer initialView="gallery" />;
}

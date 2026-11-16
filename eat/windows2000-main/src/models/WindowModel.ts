
interface WindowOptions {
  title: string;
  ico: string;
  x: number;
  y: number;
  w: number | undefined;
  h: number | undefined;
}

export class WindowModel {
  title: string;
  ico: string;
  x: number;
  y: number;
  w: number | undefined;
  h: number | undefined;
  windowElement: React.ComponentType;
  isMinimized : boolean;
  isMaximized :boolean;

  constructor(options: WindowOptions,windowElement: React.ComponentType) {

    this.windowElement=windowElement
    this.title = options.title
    this.ico = options.ico
    this.x = options.x
    this.y = options.y
    this.w = options.w
    this.h = options.h

    this.isMinimized=false
    this.isMaximized=false
  }
}
import 'fabric'

declare module 'fabric' {
  interface FabricObject {
    backgroundId?: string;

    spreadItemId?: string;
    spreadId?: string;
    imageId?: string;
  }
}
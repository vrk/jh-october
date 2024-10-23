import 'fabric'

declare module 'fabric' {
  interface FabricObject {
    spreadItemId?: string;
  }
}
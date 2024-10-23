import 'fabric'

declare module 'fabric' {
  interface FabricObject {
    spreadId?: string;
  }
}
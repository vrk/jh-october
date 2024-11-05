export type DBJournalImage = {
  id: string;
  journalId: string;
  dataUrl: string;
  height: number;
  width: number;
  thumbDataUrl: string;
  thumbWidth: number;
  thumbHeight: number;
  lastModified: number;
  photoTakenTime?: number;
  importTime: number;
};

export type JournalImageUsageInfo = {
  isUsedBySpreadId: string | null;
  isUsedBySpreadItemId: string | null;
};

export type JournalImage = DBJournalImage & JournalImageUsageInfo;

export type Journal = {
  id: string;
};

export type Spread = {
  id: string;
  journalId: string;
  order: number;

  previewThumbUrl?: string;
  previewThumbHeight?: number;
  previewThumbWidth?: number;
};

export type PrintPage  = {
  id: string;
  journalId: string;
  order: number;

  previewThumbUrl?: string;
  previewThumbHeight?: number;
  previewThumbWidth?: number;
};

// TODO: lol make this better if at all feasible (might not be)
export type FabricJsMetadata = any;

export type SpreadItem = {
  id: string;
  spreadId: string;
  imageId: string;
  fabricjsMetadata: FabricJsMetadata;
};

export type PrintItem = {
  id: string;
  printPageId: string | null;
  spreadItemId: string;
  top: number;
  left: number;
};

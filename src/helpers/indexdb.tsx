"use client";
import ShortUniqueId from "short-unique-id";
import {
  Journal,
  JournalImage,
  DBJournalImage,
  Spread,
  SpreadItem,
  FabricJsMetadata,
  PrintItem,
  PrintPage,
} from "./data-types";

const DATABASE_NAME = "OctoberJournalHelperDb";

const JOURNALS_STORE_NAME = "journals";

const IMAGES_STORE_NAME = "images";
const IMAGES_JOURNAL_ID_INDEX_NAME = "images_journal_id";

const SPREADS_STORE_NAME = "spreads";
const SPREADS_TO_JOURNAL_ID_INDEX_NAME = "spreads_journal_id";

const SPREAD_ITEMS_STORE_NAME = "spread_items";
const SPREAD_ITEM_TO_SPREAD_ID_INDEX_NAME = "spread_item_spread_id";
const SPREAD_ITEM_TO_IMAGE_ID_INDEX_NAME = "spread_item_image_id";

const PRINT_PAGES_STORE_NAME = "print_pages";
const PRINT_PAGES_TO_JOURNAL_ID_INDEX_NAME = "print_pages_journal_id";

const PRINT_ITEMS_STORE_NAME = "print_items";
const PRINT_ITEM_TO_PAGE_ID_INDEX_NAME = "print_item_page_id";
const PRINT_ITEM_TO_SPREAD_ITEM_ID_INDEX_NAME = "print_item_spread_item_id";

// TODO: make this less fragile
const JOURNAL_ID_KEY_NAME = "journalId"; // CAREFUL!! MUST MATCH JOURNALIMAGE TYPE FIELD

const PAGE_ID_KEY_NAME = "printPageId"; // CAREFUL!! MUST MATCH PAGE TYPE FIELD
const SPREAD_ITEM_ID_KEY_NAME = "spreadItemId"; // CAREFUL!! MUST MATCH PAGE TYPE FIELD

const SPREAD_ID_KEY_NAME = "spreadId"; // CAREFUL!! MUST MATCH SPREAD TYPE FIELD
const IMAGES_ID_KEY_NAME = "imageId"; // CAREFUL!! MUST MATCH SPREAD TYPE FIELD

const ID_LENGTH = 10;

export async function getDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, 2 /** version */);
    request.onerror = (event) => {
      const reason = "An error occurred with IndexedDb";
      console.error(reason, event);
      reject(reason);
    };

    // This is run the first time the database is created, or any time the database needs to be upgraded (version update)
    request.onupgradeneeded = () => {
      const db = request.result;

      // Create journal table
      db.createObjectStore(JOURNALS_STORE_NAME, { keyPath: "id" });

      const imagesStore = db.createObjectStore(IMAGES_STORE_NAME, {
        keyPath: "id",
      });
      imagesStore.createIndex(
        IMAGES_JOURNAL_ID_INDEX_NAME,
        JOURNAL_ID_KEY_NAME,
        {
          unique: false,
        }
      );

      // Create spreads table, with index into journal
      const spreadsStore = db.createObjectStore(SPREADS_STORE_NAME, {
        keyPath: "id",
      });
      spreadsStore.createIndex(
        SPREADS_TO_JOURNAL_ID_INDEX_NAME,
        JOURNAL_ID_KEY_NAME,
        {
          unique: false,
        }
      );

      // Create spreadItems table
      const spreadItemsStore = db.createObjectStore(SPREAD_ITEMS_STORE_NAME, {
        keyPath: "id",
      });
      // Create an index into the spread this item belongs to
      spreadItemsStore.createIndex(
        SPREAD_ITEM_TO_SPREAD_ID_INDEX_NAME,
        SPREAD_ID_KEY_NAME,
        {
          unique: false,
        }
      );
      // Create an index into the underlying resource for this item
      spreadItemsStore.createIndex(
        SPREAD_ITEM_TO_IMAGE_ID_INDEX_NAME,
        IMAGES_ID_KEY_NAME,
        {
          unique: false,
        }
      );

      const printPagesStore = db.createObjectStore(PRINT_PAGES_STORE_NAME, {
        keyPath: "id",
      });
      printPagesStore.createIndex(
        PRINT_PAGES_TO_JOURNAL_ID_INDEX_NAME,
        JOURNAL_ID_KEY_NAME,
        {
          unique: false,
        }
      );

      const printItemsStore = db.createObjectStore(PRINT_ITEMS_STORE_NAME, {
        keyPath: "id",
      });
      printItemsStore.createIndex(
        PRINT_ITEM_TO_PAGE_ID_INDEX_NAME,
        PAGE_ID_KEY_NAME,
        {
          unique: false,
        }
      );
      printItemsStore.createIndex(
        PRINT_ITEM_TO_SPREAD_ITEM_ID_INDEX_NAME,
        SPREAD_ITEM_ID_KEY_NAME,
        {
          unique: false,
        }
      );
    };

    request.onsuccess = () => {
      const db = request.result;
      resolve(db);
    };
  });
}

export async function getAllJournals(): Promise<Array<Journal>> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(JOURNALS_STORE_NAME);
    const objectStore = transaction.objectStore(JOURNALS_STORE_NAME);
    const request = objectStore.openCursor();
    const journals: Array<Journal> = [];
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        const journal = { id: cursor.value.id };
        journals.push(journal);
        cursor.continue();
      } else {
        resolve(journals);
      }
    };
    request.onerror = () => {
      reject("Could not get all journals");
    };
  });
}

export async function getJournalById(id: string) {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(JOURNALS_STORE_NAME);
    const objectStore = transaction.objectStore(JOURNALS_STORE_NAME);
    const request = objectStore.get(id);
    request.onerror = () => {
      reject(`Requested journal ID is not found: ${id}`);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

export async function getPhotoById(id: string): Promise<JournalImage> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(IMAGES_STORE_NAME);
    const objectStore = transaction.objectStore(IMAGES_STORE_NAME);
    const request = objectStore.get(id);
    request.onerror = () => {
      reject(`Requested resource ID is not found: ${id}`);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

export async function createJournal() {
  const journal = await createNewJournalRowInDb();
  const spread = await createSpread(journal.id);
  return { journal, spread };
}

async function createNewJournalRowInDb(): Promise<Journal> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(JOURNALS_STORE_NAME, "readwrite");
    const objectStore = transaction.objectStore(JOURNALS_STORE_NAME);
    const shortIDGenerator = new ShortUniqueId({ length: ID_LENGTH });
    const id = shortIDGenerator.randomUUID();

    const request = objectStore.add({
      id,
    });
    request.onerror = () => {
      reject(`Could not create object with id: ${id}`);
    };
    request.onsuccess = () => {
      resolve({ id });
    };
  });
}

async function getNumberOfSpreadsForJournal(
  spreadStore: IDBObjectStore,
  journalId: string
): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const journalIdIndex = spreadStore.index(SPREADS_TO_JOURNAL_ID_INDEX_NAME);
    const countRequest = journalIdIndex.count(IDBKeyRange.only(journalId));

    countRequest.onerror = () => {
      reject(`Could not count objects with journal ID: ${journalId}`);
    };
    countRequest.onsuccess = () => {
      resolve(countRequest.result);
    };
  });
}

async function getNumberOfPrintPagesForJournal(
  printPageStore: IDBObjectStore,
  journalId: string
): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const journalIdIndex = printPageStore.index(
      PRINT_PAGES_TO_JOURNAL_ID_INDEX_NAME
    );
    const countRequest = journalIdIndex.count(IDBKeyRange.only(journalId));

    countRequest.onerror = () => {
      reject(`Could not count objects with journal ID: ${journalId}`);
    };
    countRequest.onsuccess = () => {
      resolve(countRequest.result);
    };
  });
}

// Adds new spread to the end of the journal
export async function createSpread(journalId: string): Promise<Spread> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(SPREADS_STORE_NAME, "readwrite");
    const objectStore = transaction.objectStore(SPREADS_STORE_NAME);
    const shortIDGenerator = new ShortUniqueId({ length: ID_LENGTH });
    const id = shortIDGenerator.randomUUID();

    // count how many spreads we have already to get us the `order` info
    const numberSpreads = await getNumberOfSpreadsForJournal(
      objectStore,
      journalId
    );
    const spread: Spread = {
      id,
      journalId,
      order: numberSpreads, // always add to end for now
    };
    const request = objectStore.add(spread);
    request.onerror = () => {
      reject(`Could not create object with id: ${id}`);
    };
    request.onsuccess = () => {
      resolve(spread);
    };
  });
}

// Adds new page to the end of print
export async function createPrintPage(journalId: string): Promise<PrintPage> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(PRINT_PAGES_STORE_NAME, "readwrite");
    const printPagesStore = transaction.objectStore(PRINT_PAGES_STORE_NAME);
    const shortIDGenerator = new ShortUniqueId({ length: ID_LENGTH });
    const id = shortIDGenerator.randomUUID();

    // count how many spreads we have already to get us the `order` info
    const numberSpreads = await getNumberOfPrintPagesForJournal(
      printPagesStore,
      journalId
    );
    const spread: PrintPage = {
      id,
      journalId,
      order: numberSpreads, // always add to end for now
    };
    const request = printPagesStore.add(spread);
    request.onerror = () => {
      reject(`Could not create object with id: ${id}`);
    };
    request.onsuccess = () => {
      resolve(spread);
    };
  });
}

export async function updateSpreadThumbnail(
  spread: Spread,
  thumbDataUrl: string,
  thumbWidth: number,
  thumbHeight: number
): Promise<Spread> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(SPREADS_STORE_NAME, "readwrite");
    const objectStore = transaction.objectStore(SPREADS_STORE_NAME);

    const newSpreadData: Spread = {
      ...spread,
      previewThumbUrl: thumbDataUrl,
      previewThumbWidth: thumbWidth,
      previewThumbHeight: thumbHeight,
    };
    const request = objectStore.put(newSpreadData);
    request.onerror = () => {
      reject(`Could not update object with id: ${newSpreadData.id}`);
    };
    request.onsuccess = () => {
      resolve(spread);
    };
  });
}

export async function createSpreadItem(
  spreadId: string,
  imageId: string,
  fabricjsMetadata: FabricJsMetadata
): Promise<SpreadItem> {
  const shortIDGenerator = new ShortUniqueId({ length: ID_LENGTH });
  const id = shortIDGenerator.randomUUID();
  return createSpreadItemInDatabase(id, spreadId, imageId, fabricjsMetadata);
}

export async function updateSpreadItem(
  id: string,
  spreadId: string,
  imageId: string,
  fabricjsMetadata: FabricJsMetadata
): Promise<SpreadItem> {
  return createSpreadItemInDatabase(
    id,
    spreadId,
    imageId,
    fabricjsMetadata,
    true
  );
}

async function createSpreadItemInDatabase(
  id: string,
  spreadId: string,
  imageId: string,
  fabricjsMetadata: FabricJsMetadata,
  usePut = false
): Promise<SpreadItem> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(SPREAD_ITEMS_STORE_NAME, "readwrite");
    const spreadItemsStore = transaction.objectStore(SPREAD_ITEMS_STORE_NAME);

    const spreadItem: SpreadItem = {
      fabricjsMetadata,
      spreadId,
      imageId,
      id,
    };

    const request = usePut
      ? spreadItemsStore.put(spreadItem)
      : spreadItemsStore.add(spreadItem);
    request.onerror = () => {
      reject(`Could not create object with id: ${id}`);
    };
    request.onsuccess = () => {
      resolve(spreadItem);
    };
  });
}

export async function createPrintItem(
  printPageId: string,
  spreadItemId: string,
  top: number,
  left: number
): Promise<PrintItem> {
  const shortIDGenerator = new ShortUniqueId({ length: ID_LENGTH });
  const id = shortIDGenerator.randomUUID();
  return createPrintItemInDatabase(id, printPageId, spreadItemId, top, left);
}

export async function updatePrintItem(
  id: string,
  printPageId: string | null,
  spreadItemId: string,
  top: number,
  left: number
): Promise<PrintItem> {
  return createPrintItemInDatabase(
    id,
    printPageId,
    spreadItemId,
    top,
    left,
    true
  );
}

async function createPrintItemInDatabase(
  id: string,
  printPageId: string | null,
  spreadItemId: string,
  top: number,
  left: number,
  usePut = false
): Promise<PrintItem> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(PRINT_ITEMS_STORE_NAME, "readwrite");
    const printItemsStore = transaction.objectStore(PRINT_ITEMS_STORE_NAME);

    const printItem: PrintItem = {
      top,
      left,
      spreadItemId,
      printPageId,
      id,
    };

    const request = usePut
      ? printItemsStore.put(printItem)
      : printItemsStore.add(printItem);
    request.onerror = () => {
      reject(`Could not create object with id: ${id}`);
    };
    request.onsuccess = () => {
      resolve(printItem);
    };
  });
}

export async function deletePrintItem(printItemId: string) {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(PRINT_ITEMS_STORE_NAME, "readwrite");
    const printItemStore = transaction.objectStore(PRINT_ITEMS_STORE_NAME);
    const request = printItemStore.delete(printItemId);
    request.onerror = () => {
      reject(`Requested printItemId could not be deleted: ${printItemId}`);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

type JournalImageParam = {
  journalId: string;
  dataUrl: string;
  width: number;
  height: number;
  thumbDataUrl: string;
  thumbWidth: number;
  thumbHeight: number;
  importTime: number;
  lastModified: number;
  photoTakeTime?: number;
};
export async function createImageResourceForJournal(
  imageInfo: JournalImageParam
): Promise<DBJournalImage> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(IMAGES_STORE_NAME, "readwrite");
    const objectStore = transaction.objectStore(IMAGES_STORE_NAME);
    const shortIDGenerator = new ShortUniqueId({ length: ID_LENGTH });
    const id = shortIDGenerator.randomUUID();

    const object: DBJournalImage = {
      ...imageInfo,
      id,
    };

    const request = objectStore.add(object);
    request.onerror = () => {
      reject(`Could not create object with id: ${id}`);
    };
    request.onsuccess = () => {
      resolve(object);
    };
  });
}

export async function getImagesForJournalWithUsageInformation(
  journalId: string
): Promise<Array<JournalImage>> {
  const allImagesForJournal = await getAllImagesForJournal(journalId);

  const db = await getDatabase();
  const transaction = db.transaction(SPREAD_ITEMS_STORE_NAME);
  const spreadItemStore = transaction.objectStore(SPREAD_ITEMS_STORE_NAME);
  const imageIdInSpreadItemStoreIndex = spreadItemStore.index(
    SPREAD_ITEM_TO_IMAGE_ID_INDEX_NAME
  );

  const augmentedImagesPromises = allImagesForJournal.map((image) => {
    return getJournalImageWithUsageInfo(imageIdInSpreadItemStoreIndex, image);
  });
  return Promise.all(augmentedImagesPromises);
}

export async function getJournalImageWithUsageInfo(
  spreadItemStoreIndexedByImageId: IDBIndex,
  image: DBJournalImage
): Promise<JournalImage> {
  return new Promise(async (resolve, reject) => {
    const request = spreadItemStoreIndexedByImageId.get(image.id);
    request.onerror = () => {
      reject(`Requested imageId is not found: ${image.id}`);
    };
    request.onsuccess = () => {
      const spreadItem: SpreadItem | null = request.result;
      const augmented = image as JournalImage;
      augmented.isUsedBySpreadId = spreadItem ? spreadItem.spreadId : null;
      augmented.isUsedBySpreadItemId = spreadItem ? spreadItem.id : null;
      resolve(augmented);
    };
  });
}

export async function getAllSpreadsForJournal(
  journalId: string
): Promise<Array<Spread>> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(SPREADS_STORE_NAME);
    const spreadsStore = transaction.objectStore(SPREADS_STORE_NAME);
    const spreadsWithJournalIdIndex = spreadsStore.index(
      SPREADS_TO_JOURNAL_ID_INDEX_NAME
    );
    const request = spreadsWithJournalIdIndex.getAll(journalId);
    request.onerror = () => {
      reject(`Requested journal ID is not found: ${journalId}`);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

export async function getAllSpreadItemsForSpread(
  spreadId: string
): Promise<Array<SpreadItem>> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(SPREAD_ITEMS_STORE_NAME);
    const spreadItemsStore = transaction.objectStore(SPREAD_ITEMS_STORE_NAME);
    const spreadItemWithSpreadIdIndex = spreadItemsStore.index(
      SPREAD_ITEM_TO_SPREAD_ID_INDEX_NAME
    );
    const request = spreadItemWithSpreadIdIndex.getAll(spreadId);
    request.onerror = () => {
      reject(`Requested spreadId is not found: ${spreadId}`);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

export async function getAllSpreadItemsForJournal(
  journalId: string
): Promise<Array<SpreadItem>> {
  return new Promise(async (resolve, reject) => {
    const allSpreads = await getAllSpreadsForJournal(journalId);

    const db = await getDatabase();
    const transaction = db.transaction(SPREAD_ITEMS_STORE_NAME);
    const spreadItemsStore = transaction.objectStore(SPREAD_ITEMS_STORE_NAME);
    const request = spreadItemsStore.openCursor();

    const allSpreadItems: Array<SpreadItem> = [];

    const isInJournal = (cursor: IDBCursorWithValue) => {
      const result = allSpreads.find((spread) => {
        return spread.id === cursor.value.spreadId;
      });
      return result !== undefined;
    };

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        if (isInJournal(cursor)) {
          const spreadItem: SpreadItem = {
            id: cursor.value.id,
            spreadId: cursor.value.spreadId,
            imageId: cursor.value.imageId,
            fabricjsMetadata: cursor.value.fabricjsMetadata,
          };
          allSpreadItems.push(spreadItem);
        }
        cursor.continue();
      } else {
        resolve(allSpreadItems);
      }
    };
    request.onerror = () => {
      reject("Could not get all spread items");
    };
  });
}

export async function getAllPrintPagesForJournal(
  journalId: string
): Promise<Array<PrintPage>> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(PRINT_PAGES_STORE_NAME);
    const printPagesStore = transaction.objectStore(PRINT_PAGES_STORE_NAME);
    const pagesWithJournalIdIndex = printPagesStore.index(
      PRINT_PAGES_TO_JOURNAL_ID_INDEX_NAME
    );
    const request = pagesWithJournalIdIndex.getAll(journalId);
    request.onerror = () => {
      reject(`Requested journal ID is not found: ${journalId}`);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

export async function getAllPrintItemsForPage(
  printPageId: string
): Promise<Array<PrintItem>> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(PRINT_ITEMS_STORE_NAME);
    const printItemsStore = transaction.objectStore(PRINT_ITEMS_STORE_NAME);
    const printItemWithPrintPageIdIndex = printItemsStore.index(
      PRINT_ITEM_TO_PAGE_ID_INDEX_NAME
    );
    const request = printItemWithPrintPageIdIndex.getAll(printPageId);
    request.onerror = () => {
      reject(`Requested spreadId is not found: ${printPageId}`);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

export async function getAllImagesForJournal(
  journalId: string
): Promise<Array<DBJournalImage>> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(IMAGES_STORE_NAME);
    const imagesStore = transaction.objectStore(IMAGES_STORE_NAME);
    const journalIdIndex = imagesStore.index(IMAGES_JOURNAL_ID_INDEX_NAME);
    const request = journalIdIndex.getAll(journalId);
    request.onerror = () => {
      reject(`Requested journal ID is not found: ${journalId}`);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

export async function deleteImageResource(imageId: string) {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(IMAGES_STORE_NAME, "readwrite");
    const objectStore = transaction.objectStore(IMAGES_STORE_NAME);
    const request = objectStore.delete(imageId);
    request.onerror = () => {
      reject(`Requested image ID could not be deleted: ${imageId}`);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

function deleteAllSpreadItemsForSpread(spreadId: string) {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(SPREAD_ITEMS_STORE_NAME, "readwrite");
    const spreadItemsStore = transaction.objectStore(SPREAD_ITEMS_STORE_NAME);
    const spreadItemWithSpreadIdIndex = spreadItemsStore.index(
      SPREAD_ITEM_TO_SPREAD_ID_INDEX_NAME
    );
    const request = spreadItemWithSpreadIdIndex.openCursor(spreadId);
    request.onerror = () => {
      reject(`Requested spreadId is not found: ${spreadId}`);
    };
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve(true);
      }
    };
  });
}

export async function deleteSpread(spreadId: string) {
  return new Promise(async (resolve, reject) => {
    await deleteAllSpreadItemsForSpread(spreadId);

    const db = await getDatabase();
    const transaction = db.transaction(SPREADS_STORE_NAME, "readwrite");
    const spreadsStore = transaction.objectStore(SPREADS_STORE_NAME);
    const request = spreadsStore.delete(spreadId);
    request.onerror = () => {
      reject(`Requested spread ID could not be deleted: ${spreadId}`);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

export async function deleteSpreadItem(spreadItemId: string) {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(SPREAD_ITEMS_STORE_NAME, "readwrite");
    const spreadItemStore = transaction.objectStore(SPREAD_ITEMS_STORE_NAME);
    const request = spreadItemStore.delete(spreadItemId);
    request.onerror = () => {
      reject(`Requested spreadItemId could not be deleted: ${spreadItemId}`);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

function deleteAllPrintItemsForPage(printPageId: string) {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(PRINT_ITEMS_STORE_NAME, "readwrite");
    const printItemsStore = transaction.objectStore(PRINT_ITEMS_STORE_NAME);
    const printItemsByPageIdIndex = printItemsStore.index(
      PRINT_ITEM_TO_PAGE_ID_INDEX_NAME
    );
    const request = printItemsByPageIdIndex.openCursor(printPageId);
    request.onerror = () => {
      reject(`Requested spreadId is not found: ${printPageId}`);
    };
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve(true);
      }
    };
  });
}

export async function deletePrintPage(printPageId: string) {
  return new Promise(async (resolve, reject) => {
    await deleteAllPrintItemsForPage(printPageId);

    const db = await getDatabase();
    const transaction = db.transaction(PRINT_PAGES_STORE_NAME, "readwrite");
    const printPagesStore = transaction.objectStore(PRINT_PAGES_STORE_NAME);
    const request = printPagesStore.delete(printPageId);
    request.onerror = () => {
      reject(`Requested spread ID could not be deleted: ${printPageId}`);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

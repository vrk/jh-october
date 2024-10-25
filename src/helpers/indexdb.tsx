"use client";
import ShortUniqueId from "short-unique-id";

const DATABASE_NAME = "OctoberJournalHelperDb";

const JOURNALS_STORE_NAME = "journals";

const IMAGES_STORE_NAME = "images";
const IMAGES_JOURNAL_ID_INDEX_NAME = "images_journal_id";

const SPREADS_STORE_NAME = "spreads";
const SPREADS_TO_JOURNAL_ID_INDEX_NAME = "spreads_journal_id";

const SPREAD_ITEMS_STORE_NAME = "spread_items";
const SPREAD_ITEM_TO_SPREAD_ID_INDEX_NAME = "spread_item_spread_id";
const SPREAD_ITEM_TO_IMAGE_ID_INDEX_NAME = "spread_item_image_id";

// TODO: make this less fragile
const JOURNAL_ID_KEY_NAME = "journalId"; // CAREFUL!! MUST MATCH JOURNALIMAGE TYPE FIELD
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
};

// TODO: lol make this better if at all feasible (might not be)
export type FabricJsMetadata = any;

export type SpreadItem = {
  id: string;
  spreadId: string;
  imageId: string;
  fabricjsMetadata: FabricJsMetadata;
};

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
  return createSpreadItemInDatabase(id, spreadId, imageId, fabricjsMetadata, true);
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

    const object: JournalImage = {
      ...imageInfo,
      isUsedBySpreadId: null,
      isUsedBySpreadItemId: null,
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

export async function getAllSpreadItemIdsForSpread(
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

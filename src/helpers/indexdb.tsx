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
export type JournalImage = {
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

export type Journal = {
  id: string;
};

export type SpreadItem = {
  id: string;
  spreadId: string;
  imageId: string;
}

const SPREAD_ID_KEY_NAME = "spreadId"; // CAREFUL!! MUST MATCH SPREAD TYPE FIELD
const IMAGES_ID_KEY_NAME = "imagesId"; // CAREFUL!! MUST MATCH SPREAD TYPE FIELD

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
      const spreadsStore = db.createObjectStore(SPREADS_STORE_NAME, { keyPath: "id" });
      spreadsStore.createIndex(
        SPREADS_TO_JOURNAL_ID_INDEX_NAME,
        JOURNAL_ID_KEY_NAME,
        {
          unique: false,
        }
      );

      // Create spreadItems table
      const spreadItemsStore = db.createObjectStore(SPREAD_ITEMS_STORE_NAME, { keyPath: "id" });
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
    console.log('id is', id);
    const request = objectStore.get(id);
    request.onerror = () => {
      reject(`Requested resource ID is not found: ${id}`);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

export async function createNewJournal() {
  const journal = await createNewJournalRowInDb();
  const spread = await createNewSpreadForJournal(journal.id);
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

async function getNumberOfSpreadsForJournal(spreadStore: IDBObjectStore, journalId: string) {
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
export async function createNewSpreadForJournal(journalId: string) {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(SPREADS_STORE_NAME, "readwrite");
    const objectStore = transaction.objectStore(SPREADS_STORE_NAME);
    const shortIDGenerator = new ShortUniqueId({ length: ID_LENGTH });
    const id = shortIDGenerator.randomUUID();

    // count how many spreads we have already to get us the `order` info
    const numberSpreads = await getNumberOfSpreadsForJournal(objectStore, journalId);

    const request = objectStore.add({
      id,
      journalId,
      order: numberSpreads // always add to end
    });
    request.onerror = () => {
      reject(`Could not create object with id: ${id}`);
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
export async function createNewImageResourceForJournal(
  imageInfo: JournalImageParam
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(IMAGES_STORE_NAME, "readwrite");
    const objectStore = transaction.objectStore(IMAGES_STORE_NAME);
    const shortIDGenerator = new ShortUniqueId({ length: ID_LENGTH });
    const id = shortIDGenerator.randomUUID();

    const object: JournalImage = {
      ...imageInfo,
      id,
    };

    const request = objectStore.add(object);
    request.onerror = () => {
      reject(`Could not create object with id: ${id}`);
    };
    request.onsuccess = () => {
      resolve(id);
    };
  });
}

export async function getUnusedImagesForJournal(
  journalId: string
): Promise<Array<JournalImage>> {
    const allImagesForJournal = await getAllImagesForJournal(journalId);

    const db = await getDatabase();
    const transaction = db.transaction(SPREAD_ITEMS_STORE_NAME);
    const spreadItemStore = transaction.objectStore(SPREAD_ITEMS_STORE_NAME);
    const imageIdInSpreadItemStoreIndex = spreadItemStore.index(SPREAD_ITEM_TO_IMAGE_ID_INDEX_NAME);

    const unusedImagesPromises = allImagesForJournal.map((image) => {
      return nullifyIfInUse(imageIdInSpreadItemStoreIndex, image)
    });
    const unusedImagesWithNulls = await Promise.all(unusedImagesPromises);

    // Return all non-null values
    const unusedImagesNoNulls = unusedImagesWithNulls.filter(image => image) as Array<JournalImage>;
    return unusedImagesNoNulls;
}

// This is a bit of a weird function -- basically it resolves to null if the image is in use by this index,
// or it returns itself if it's not in use. I'm using this to only grab the unused images from the store.
// TODO: make less weird
export async function nullifyIfInUse(
  imageIndexForSpreadItemStore: IDBIndex, image: JournalImage
): Promise<JournalImage|null> {
  return new Promise(async (resolve, reject) => {
    const request = imageIndexForSpreadItemStore.get(image.id);
    request.onerror = () => {
      reject(`Requested imageId is not found: ${image.id}`);
    };
    request.onsuccess = () => {
      if (request.result) {
        resolve(null);
      } else {
        resolve(image)
      }
    };
  });
}

export async function getAllImagesForJournal(
  journalId: string
): Promise<Array<JournalImage>> {
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

export async function deleteImageResource(
  imageId: string
) {
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

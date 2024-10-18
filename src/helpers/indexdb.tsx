"use client";
import ShortUniqueId from "short-unique-id";

const DATABASE_NAME = "OctoberJournalHelperDb";

const JOURNALS_STORE_NAME = "journals";
const RESOURCES_STORE_NAME = "resources";
const RESOURCES_JOURNAL_ID_INDEX_NAME = "resources_journal_id";

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
  importTime: number;
};

const ID_LENGTH = 10;

export async function getDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, 1.1 /** version */);
    request.onerror = (event) => {
      const reason = "An error occurred with IndexedDb";
      console.error(reason, event);
      reject(reason);
    };

    // This is run the first time the database is created, or any time the database needs to be upgraded (version update)
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore(JOURNALS_STORE_NAME, { keyPath: "id" });
      const resourcesStore = db.createObjectStore(RESOURCES_STORE_NAME, {
        keyPath: "id",
      });

      resourcesStore.createIndex(
        RESOURCES_JOURNAL_ID_INDEX_NAME,
        JOURNAL_ID_KEY_NAME,
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

export type Journal = {
  id: string;
};

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

export async function createNewJournal() {
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
};
export async function createNewImageResourceForJournal(
  imageInfo: JournalImageParam
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(RESOURCES_STORE_NAME, "readwrite");
    const objectStore = transaction.objectStore(RESOURCES_STORE_NAME);
    const shortIDGenerator = new ShortUniqueId({ length: ID_LENGTH });
    const id = shortIDGenerator.randomUUID();

    const object: JournalImage = {
      ...imageInfo,
      id,
      type: "image",
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

export async function getImagesForJournal(
  journalId: string
): Promise<Array<JournalImage>> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(RESOURCES_STORE_NAME);
    const objectStore = transaction.objectStore(RESOURCES_STORE_NAME);
    const journalIdIndex = objectStore.index(RESOURCES_JOURNAL_ID_INDEX_NAME);
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
    const transaction = db.transaction(RESOURCES_STORE_NAME, "readwrite");
    const objectStore = transaction.objectStore(RESOURCES_STORE_NAME);
    const request = objectStore.delete(imageId);
    request.onerror = () => {
      reject(`Requested image ID could not be deleted: ${imageId}`);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

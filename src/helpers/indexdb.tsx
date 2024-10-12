"use client";
import ShortUniqueId from 'short-unique-id';

const DATABASE_NAME = "OctoberJournalHelperDb";

const JOURNALS_STORE_NAME = "journals";
const RESOURCES_STORE_NAME = "resources";

export async function getDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, 1 /** version */);
    request.onerror = (event) => {
      const reason = "An error occurred with IndexedDb";
      console.error(reason, event);
      reject(reason);
    };

    // This is run the first time the database is created, or any time the database needs to be upgraded (version update)
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore(JOURNALS_STORE_NAME, { keyPath: "id" });
      db.createObjectStore(RESOURCES_STORE_NAME, { keyPath: "id" });
    };

    request.onsuccess = () => {
      const db = request.result;
      resolve(db);
    };
  });
}

export type Journal = {
  id: string
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
      reject('Could not get all journals');
    }
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
    const transaction = db.transaction(JOURNALS_STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(JOURNALS_STORE_NAME);
    const shortIDGenerator = new ShortUniqueId({ length: 10});
    const id = shortIDGenerator.randomUUID();
    
    const request = objectStore.add({ 
      id
    });
    request.onerror = () => {
      reject(`Could not create object with id: ${id}`);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

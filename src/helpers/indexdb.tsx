"use client";

const DATABASE_NAME = "OctoberJournalHelperDb";

const JOURNALS_STORE_NAME = "journals";
const RESOURCES_STORE_NAME = "resources";

async function getDatabase(): Promise<IDBDatabase> {
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

async function getJournalById(id: string) {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(JOURNALS_STORE_NAME);
    const objectStore = transaction.objectStore(JOURNALS_STORE_NAME);
    const request = objectStore.get(id);
    request.onerror = (event) => {
      reject(`Requested journal ID is not found: ${id}`);
    };
    request.onsuccess = (event) => {
      resolve(request.result);
    };
  });
}

async function createNewJournal(id: string) {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase();
    const transaction = db.transaction(JOURNALS_STORE_NAME);
    const objectStore = transaction.objectStore(JOURNALS_STORE_NAME);
    const request = objectStore.add({ 
      id
    });
    request.onerror = (event) => {
      reject(`Could not create object with id: ${id}`);
    };
    request.onsuccess = (event) => {
      resolve(request.result);
    };
  });
}

"use client";
import {
  createImageResourceForJournal,
  createSpread,
  createSpreadItem,
  deleteImageResource,
  getAllSpreadItemsForSpread,
  getAllSpreadsForJournal,
  Spread,
  SpreadItem,
} from "@/helpers/indexdb";
import React from "react";
import {
  deleteSpreadItem,
  getImagesForJournalWithUsageInformation,
  JournalImage,
} from "@/helpers/indexdb";

type JournalContextType = {
  journalId: string | null;
  currentSpreadId: string | null;
  currentSpreadItems: Array<SpreadItem>;

  allSpreads: Array<Spread>;
  loadedImages: Array<JournalImage>;

  journalLoadedStatus: JournalLoadedStatus;

  setCurrentSpreadId: (currentSpreadId: string) => void;

  addLoadedImages: (loadedImages: Array<JournalImage>) => Promise<void>;
  deleteLoadedImage: (idToDelete: string) => Promise<void>;

  addSpread: () => Promise<void>;
  deleteSpread: (spreadId: string) => Promise<void>;

  addSpreadItem: (
    imageId: string,
    fabricJsMetadata: any
  ) => Promise<SpreadItem>;
  updateSpreadItem: (item: SpreadItem) => Promise<void>;
  deleteSpreadItems: (idsToDelete: Array<string>) => Promise<void>;
};

type JournalContextProps = {
  journalId: string;
};

export enum JournalLoadedStatus {
  Uninitialized,
  Loading,
  Loaded,
}

export const JournalContext = React.createContext<JournalContextType>({
  journalId: null,
  currentSpreadId: null,
  currentSpreadItems: [],

  allSpreads: [],
  loadedImages: [],
  journalLoadedStatus: JournalLoadedStatus.Uninitialized,

  setCurrentSpreadId: (currentSpreadId: string) => {},

  addLoadedImages: async (loadedImages: Array<JournalImage>) => {},
  deleteLoadedImage: async (idToDelete: string) => {},

  addSpread: async () => {},
  deleteSpread: async (spreadId: string) => {},

  addSpreadItem: async () => {
    throw new Error();
  },
  updateSpreadItem: async (item: SpreadItem) => {},
  deleteSpreadItems: async (idsToDelete: Array<string>) => {},
});
const JournalContextProvider = ({
  journalId,
  children,
}: React.PropsWithChildren<JournalContextProps>) => {
  const [allSpreads, setAllSpreadsState] = React.useState<Array<Spread>>([]);
  const [currentSpreadId, setCurrentSpreadIdState] = React.useState<
    string | null
  >(null);
  const [currentSpreadItems, setCurrentSpreadItemsState] = React.useState<
    Array<SpreadItem>
  >([]);
  // TODO: Check perf of this
  const [loadedImages, setLoadedImagesState] = React.useState<
    Array<JournalImage>
  >([]);
  const [journalLoadedStatus, setJournalLoadedStatus] = React.useState(
    JournalLoadedStatus.Uninitialized
  );

  const setCurrentSpreadId = async (newSpreadId: string) => {
    setCurrentSpreadIdState(newSpreadId);
    const spreadItems = await getAllSpreadItemsForSpread(newSpreadId);
    setCurrentSpreadItemsState(spreadItems);
  };

  const initalizeContext = async () => {
    // Get all the spreads
    const allSpreads = await getAllSpreadsForJournal(journalId);
    allSpreads.sort((a, b) => {
      return a.order - b.order;
    });

    if (allSpreads.length === 0) {
      throw new Error("assertion error");
    }
    setAllSpreadsState(allSpreads);
    const [firstSpread] = allSpreads;
    await setCurrentSpreadId(firstSpread.id);

    // Now load all the images
    const loadedImages = await getImagesForJournalWithUsageInformation(
      journalId
    );
    setLoadedImagesState(loadedImages);
  };

  React.useEffect(() => {
    setJournalLoadedStatus(JournalLoadedStatus.Loading);
    initalizeContext().then(() => {
      setJournalLoadedStatus(JournalLoadedStatus.Loaded);
    });
  }, []);

  const addLoadedImages = async (newImages: Array<JournalImage>) => {
    const dbPromises = [];
    for (const imageInfo of newImages) {
      const promise = createImageResourceForJournal(imageInfo);
      dbPromises.push(promise);
    }
    const newlyAddedImages = await Promise.all(dbPromises);
    const newLoadedImages: Array<JournalImage> = [];
    newlyAddedImages.forEach((image) => {
      const asLoadedImage = image as JournalImage;
      asLoadedImage.isUsedBySpreadId = null;
      asLoadedImage.isUsedBySpreadItemId = null;
      newLoadedImages.push(asLoadedImage);
    });
    setLoadedImagesState([...loadedImages, ...newLoadedImages]);
  };

  const deleteLoadedImage = async (idToDelete: string) => {
    await deleteImageResource(idToDelete);

    const allButImage = loadedImages.filter((i) => i.id !== idToDelete);
    setLoadedImagesState([...allButImage]);
  };

  const addSpread = async () => {
    const newSpread = await createSpread(journalId);

    setCurrentSpreadIdState(newSpread.id);
    setCurrentSpreadItems([]);
  };

  const deleteSpread = async (idToDelete: string) => {
    await deleteSpread(idToDelete);

    const allButSpread = allSpreads.filter((i) => i.id !== idToDelete);
    setAllSpreadsState([...allButSpread]);
  };

  const setCurrentSpreadItems = (items: Array<SpreadItem>) => {
    if (!currentSpreadId) {
      throw new Error("assertion error");
    }
    setCurrentSpreadItemsState(items);
    const newLoadedImages = getUpdatedLoadedImages(
      currentSpreadId,
      items,
      loadedImages
    );
    setLoadedImagesState(newLoadedImages);
  };

  const addSpreadItem = async (imageId: string, fabricJsMetadata: any) => {
    if (!currentSpreadId) {
      throw new Error("assertion error: current spread id is null");
    }

    const spreadItem = await createSpreadItem(
      currentSpreadId,
      imageId,
      fabricJsMetadata
    );

    setCurrentSpreadItems([...currentSpreadItems, spreadItem]);
    return spreadItem;
  };

  const updateSpreadItem = async (updatedItem: SpreadItem) => {
    const otherSpreadItems = currentSpreadItems.filter(
      (i) => updatedItem.id !== i.id
    );
    const newSpreadItems = [...otherSpreadItems, updatedItem];
    setCurrentSpreadItems(newSpreadItems);
    await updateSpreadItem(updatedItem);
  };

  const deleteSpreadItems = async (deletedSpreadIds: Array<string>) => {
    const newSpreadItems = currentSpreadItems.filter((current) => {
      if (deletedSpreadIds.includes(current.id)) {
        return false;
      }
      return true;
    });

    setCurrentSpreadItems([...newSpreadItems]);

    const deletionPromises = deletedSpreadIds.map((spreadItemId) => deleteSpreadItem(spreadItemId));
    await Promise.all(deletionPromises);

  };

  return (
    <JournalContext.Provider
      value={{
        journalId,
        journalLoadedStatus,
        currentSpreadId,
        currentSpreadItems,
        loadedImages,
        allSpreads,
        addSpread,
        addLoadedImages,
        setCurrentSpreadId,
        deleteLoadedImage,
        deleteSpread,
        addSpreadItem,
        updateSpreadItem,
        deleteSpreadItems,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};

const getUpdatedLoadedImages = (
  currentSpreadId: string,
  newSpreadItems: Array<SpreadItem>,
  oldLoadedImages: Array<JournalImage>
) => {
  const imageIdsCurrentlyUsedInSpread = newSpreadItems.map(
    (item) => item.imageId
  );

  const yepItsABigCopyOhWell = [...oldLoadedImages];

  // Get the images that had been being used in this spread.
  const imagesPreviouslyUsedInThisSpread = yepItsABigCopyOhWell.filter(
    (image) => image.isUsedBySpreadId === currentSpreadId
  );

  // Check whether or not it's still being used.
  for (const loadedImage of imagesPreviouslyUsedInThisSpread) {
    // If not, update state accordingly.
    if (!imageIdsCurrentlyUsedInSpread.includes(loadedImage.id)) {
      loadedImage.isUsedBySpreadId = null;
      loadedImage.isUsedBySpreadItemId = null;
    }
  }
  // Now get all the images used in the spread
  const imagesCurrentlyUsedInSpread = yepItsABigCopyOhWell.filter((image) =>
    imageIdsCurrentlyUsedInSpread.includes(image.id)
  );
  for (const loadedImage of imagesCurrentlyUsedInSpread) {
    loadedImage.isUsedBySpreadId = currentSpreadId;
    const spreadItem = newSpreadItems.find(
      (el) => el.imageId === loadedImage.id
    );
    if (!spreadItem) {
      throw new Error("coding error");
    }
    loadedImage.isUsedBySpreadItemId = spreadItem.id;
  }
  return yepItsABigCopyOhWell;
};

export default JournalContextProvider;

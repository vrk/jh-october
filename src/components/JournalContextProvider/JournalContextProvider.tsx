"use client";
import React from "react";
import * as database from "@/helpers/indexdb";
import { JournalImage, Spread, SpreadItem } from "@/helpers/data-types";
import { isDataView } from "util/types";

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

  const setCurrentSpreadIdAndUpdateItems = async (newSpreadId: string) => {
    setCurrentSpreadIdState(newSpreadId);
    const spreadItems = await database.getAllSpreadItemsForSpread(newSpreadId);
    setCurrentSpreadItemsState(spreadItems);
  };

  const initalizeContext = async () => {
    // Get all the spreads
    const allSpreads = await database.getAllSpreadsForJournal(journalId);
    allSpreads.sort((a, b) => {
      return a.order - b.order;
    });

    if (allSpreads.length === 0) {
      throw new Error("assertion error");
    }
    setAllSpreadsState(allSpreads);
    const [firstSpread] = allSpreads;
    await setCurrentSpreadIdAndUpdateItems(firstSpread.id);

    // Now load all the images
    const loadedImages = await database.getImagesForJournalWithUsageInformation(
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
      const promise = database.createImageResourceForJournal(imageInfo);
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
    await database.deleteImageResource(idToDelete);

    const allButImage = loadedImages.filter((i) => i.id !== idToDelete);
    setLoadedImagesState([...allButImage]);
  };

  const addSpread = async () => {
    const newSpread = await database.createSpread(journalId);

    setCurrentSpreadIdState(newSpread.id);
    setCurrentSpreadItemsState([]);
    setAllSpreadsState([...allSpreads, newSpread]);
  };

  const deleteSpread = async (idToDelete: string) => {
    await database.deleteSpread(idToDelete);

    // Delete spread from React state
    const allButSpread = allSpreads.filter((i) => i.id !== idToDelete);
    setAllSpreadsState([...allButSpread]);

    // Update loaded images 
    const newLoadedImages = getLoadedImagesWithoutSpread(idToDelete, loadedImages);
    setLoadedImagesState(newLoadedImages);

    if (idToDelete === currentSpreadId) {
      const [firstSpread] = allButSpread;
      if (!firstSpread) {
        throw new Error('assertion error - deleted last spread')
      }
      setCurrentSpreadIdAndUpdateItems(firstSpread.id)
    }
  };

  const setCurrentSpreadItemsAndUpdateLoadedImages = (items: Array<SpreadItem>) => {
    if (!currentSpreadId) {
      throw new Error("assertion error");
    }
    setCurrentSpreadItemsState([...items]);
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

    const spreadItem = await database.createSpreadItem(
      currentSpreadId,
      imageId,
      fabricJsMetadata
    );

    setCurrentSpreadItemsAndUpdateLoadedImages([...currentSpreadItems, spreadItem]);
    return spreadItem;
  };

  const setCurrentSpreadId = async (spreadId: string) => {
    return setCurrentSpreadIdAndUpdateItems(spreadId);
  }

  const updateSpreadItem = async (updatedItem: SpreadItem) => {
    const otherSpreadItems = currentSpreadItems.filter(
      (i) => updatedItem.id !== i.id
    );
    const newSpreadItems = [...otherSpreadItems, updatedItem];
    setCurrentSpreadItemsAndUpdateLoadedImages(newSpreadItems);
    await database.updateSpreadItem(
      updatedItem.id,
      updatedItem.spreadId,
      updatedItem.imageId,
      updatedItem.fabricjsMetadata
    );
  };

  const deleteSpreadItems = async (deletedSpreadIds: Array<string>) => {
    const newSpreadItems = currentSpreadItems.filter((current) => {
      if (deletedSpreadIds.includes(current.id)) {
        return false;
      }
      return true;
    });

    setCurrentSpreadItemsAndUpdateLoadedImages([...newSpreadItems]);

    const deletionPromises = deletedSpreadIds.map((spreadItemId) =>
      database.deleteSpreadItem(spreadItemId)
    );
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

const getLoadedImagesWithoutSpread = (
  deletedSpreadId: string,
  oldLoadedImages: Array<JournalImage>
) => {
  const oldLoadedImagesCopy = [...oldLoadedImages];
  for (const image of oldLoadedImages) {
    if (image.isUsedBySpreadId === deletedSpreadId) {
      image.isUsedBySpreadId = null;
      image.isUsedBySpreadItemId = null;
    }
  }
  return oldLoadedImagesCopy;
};

const getUpdatedLoadedImages = (
  currentSpreadId: string,
  newSpreadItems: Array<SpreadItem>,

  oldLoadedImages: Array<JournalImage>
) => {
  const oldLoadedImagesCopy = [...oldLoadedImages];

  function getSpreadItem(image: JournalImage) {
    for (const item of newSpreadItems) {
      if (image.id === item.imageId) {
        return item;
      }
    }
    return null;
  }

  for (const image of oldLoadedImages) {
    const spreadItem = getSpreadItem(image);
    if (spreadItem) {
      image.isUsedBySpreadId = currentSpreadId;
      image.isUsedBySpreadItemId = spreadItem.id;
    } else if (image.isUsedBySpreadId === currentSpreadId) {
      image.isUsedBySpreadId = null;
      image.isUsedBySpreadItemId = null;
    }
  }
  return oldLoadedImagesCopy;
};

export default JournalContextProvider;

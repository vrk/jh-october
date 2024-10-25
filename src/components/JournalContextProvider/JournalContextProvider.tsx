"use client";
import {
  getAllSpreadItemIdsForSpread,
  getAllSpreadsForJournal,
  Spread,
  SpreadItem,
} from "@/helpers/indexdb";
import React from "react";
import {
  getImagesForJournalWithUsageInformation,
  JournalImage,
} from "@/helpers/indexdb";

type JournalContextType = {
  journalId: string | null;
  currentSpreadId: string | null;
  allSpreads: Array<Spread>;
  currentSpreadItems: Array<SpreadItem>;
  loadedImages: Array<JournalImage>;
  journalLoadedStatus: JournalLoadedStatus;
  setLoadedImages: (loadedImages: Array<JournalImage>) => void;
  setCurrentSpreadId: (currentSpreadId: string) => void;
  setAllSpreads: (allSpreads: Array<Spread>) => void;
  setCurrentSpreadItems: (currentSpreadItemIds: Array<SpreadItem>) => void;
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
  allSpreads: [],
  currentSpreadItems: [],
  loadedImages: [],
  journalLoadedStatus: JournalLoadedStatus.Uninitialized,
  setLoadedImages: () => {},
  setCurrentSpreadId: () => {},
  setAllSpreads: () => {},
  setCurrentSpreadItems: () => {},
});
const JournalContextProvider = ({
  journalId,
  children,
}: React.PropsWithChildren<JournalContextProps>) => {
  const [allSpreads, setAllSpreads] = React.useState<Array<Spread>>([]);
  const [currentSpreadId, setCurrentSpreadId] = React.useState<string | null>(
    null
  );
  const [currentSpreadItems, setCurrentSpreadItems] = React.useState<
    Array<SpreadItem>
  >([]);
  // TODO: Check perf of this
  const [loadedImages, setLoadedImages] = React.useState<Array<JournalImage>>(
    []
  );
  const [journalLoadedStatus, setJournalLoadedStatus] = React.useState(
    JournalLoadedStatus.Uninitialized
  );

  const initalizeContext = async () => {
    // Get all the spreads
    const allSpreads = await getAllSpreadsForJournal(journalId);
    allSpreads.sort((a, b) => {
      return a.order - b.order;
    })

    if (allSpreads.length === 0) {
      throw new Error("assertion error");
    }
    setAllSpreads(allSpreads);
    const [firstSpread] = allSpreads;
    setCurrentSpreadId(firstSpread.id);

    // Get all the spread items
    const spreadItems = await getAllSpreadItemIdsForSpread(firstSpread.id);
    setCurrentSpreadItems(spreadItems);

    // Now load all the images
    const loadedImages = await getImagesForJournalWithUsageInformation(
      journalId
    );
    setLoadedImages(loadedImages);
  };

  React.useEffect(() => {
    setJournalLoadedStatus(JournalLoadedStatus.Loading);
    initalizeContext().then(() => {
      setJournalLoadedStatus(JournalLoadedStatus.Loaded);
    });
  }, []);

  // Update the loaded images based on changes to the current spread items
  // A bit hacky
  // TODO: see if there's a more elegant way
  React.useEffect(() => {
    console.log('UPDATTINGGGG LOADED IMAGES')
    const imageIdsCurrentlyUsedInSpread = currentSpreadItems.map(
      (item) => item.imageId
    );

    const yepItsABigCopyOhWell = [...loadedImages];

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
      const spreadItem = currentSpreadItems.find(
        (el) => el.imageId === loadedImage.id
      );
      if (!spreadItem) {
        throw new Error("coding error");
      }
      loadedImage.isUsedBySpreadItemId = spreadItem.id;
    }

    setLoadedImages(yepItsABigCopyOhWell);
  }, [currentSpreadItems, setLoadedImages]);

  return (
    <JournalContext.Provider
      value={{
        journalId,
        journalLoadedStatus,
        currentSpreadId,
        setCurrentSpreadId,
        allSpreads,
        setAllSpreads,
        currentSpreadItems,
        setCurrentSpreadItems,
        loadedImages,
        setLoadedImages,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};

export default JournalContextProvider;

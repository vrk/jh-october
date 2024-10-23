"use client";
import {
  getAllSpreadItemIdsForSpread,
  getAllSpreadsForJournal,
  Spread,
  SpreadItem,
} from "@/helpers/indexdb";
import React from "react";
import {
  createImageResourceForJournal,
  getImagesForJournalWithUsageInformation,
  JournalImage,
} from "@/helpers/indexdb";

type JournalContextType = {
  journalId: string | null;
  currentSpreadId: string | null;
  allSpreads: Array<Spread>;
  currentSpreadItems: Array<SpreadItem>;
  loadedImages: Array<JournalImage>;
  setLoadedImages: (loadedImages: Array<JournalImage>) => void;
  setCurrentSpreadId: (currentSpreadId: string) => void;
  setAllSpreads: (allSpreads: Array<Spread>) => void;
  setCurrentSpreadItems: (currentSpreadItemIds: Array<SpreadItem>) => void;
};

type JournalContextProps = {
  journalId: string;
};

export const JournalContext = React.createContext<JournalContextType>({
  journalId: null,
  currentSpreadId: null,
  allSpreads: [],
  currentSpreadItems: [],
  loadedImages: [],
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

  React.useEffect(() => {
    getAllSpreadsForJournal(journalId).then((spreads) => {
      setAllSpreads(spreads);
      if (spreads.length >= 1) {
        setCurrentSpreadId(spreads[0].id);
      }
    });
  }, [setAllSpreads, setCurrentSpreadId]);

  React.useEffect(() => {
    if (!currentSpreadId) {
      return;
    }
    getAllSpreadItemIdsForSpread(currentSpreadId).then((spreadItems) => {
      setCurrentSpreadItems(spreadItems);
    });
  }, [currentSpreadId, setCurrentSpreadItems]);

  // Load all the images
  React.useEffect(() => {
    if (!journalId) {
      return;
    }
    getImagesForJournalWithUsageInformation(journalId).then((loadedImages) => {
      console.log("loaded", loadedImages);
      setLoadedImages(loadedImages);
    });
  }, [journalId, setLoadedImages]);

  // Update the loaded images based on changes to the current spread items
  // A bit hacky
  // TODO: see if there's a more elegant way
  React.useEffect(() => {
    console.log("udating images or at least attempting to", loadedImages);
    setLoadedImages((loadedImages) => {
      const imageIdsCurrentlyUsedInSpread = currentSpreadItems.map(
        (item) => item.imageId
      );

      // Get the images that had been being used in this spread.
      const imagesPreviouslyUsedInThisSpread = loadedImages.filter(
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
      const imagesCurrentlyUsedInSpread = loadedImages.filter((image) =>
        imageIdsCurrentlyUsedInSpread.includes(image.id)
      );
      for (const loadedImage of imagesCurrentlyUsedInSpread) {
        loadedImage.isUsedBySpreadId = currentSpreadId;
        const spreadItem = currentSpreadItems.find(
          (el) => (el.imageId = loadedImage.id)
        );
        if (!spreadItem) {
          throw new Error("coding error");
        }
        loadedImage.isUsedBySpreadItemId = spreadItem.id;
      }
      return [...loadedImages];
    });
  }, [currentSpreadItems, setLoadedImages]);

  return (
    <JournalContext.Provider
      value={{
        journalId,
        currentSpreadId,
        setCurrentSpreadId,
        allSpreads,
        setAllSpreads,
        currentSpreadItems,
        setCurrentSpreadItems,
        loadedImages,
        setLoadedImages
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};

export default JournalContextProvider;

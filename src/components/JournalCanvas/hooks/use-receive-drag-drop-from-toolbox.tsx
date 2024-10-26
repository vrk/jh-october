import React from "react";
import { Canvas, FabricImage } from "fabric";
import {
  addFabricImageToCanvas,
  fitFabricImageToRectangle,
  getFabricImageWithoutSrc,
} from "@/helpers/canvas-helpers";
import { useDrop } from "react-dnd";
import {
  THUMBNAIL_DRAG_ACCEPT_TYPE,
  ThumbnailDragParameteters,
} from "@/helpers/drag-and-drop-helpers";
import { augmentFabricImageWithSpreadItemMetadata } from "@/helpers/editable-object";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";

function useReceiveDragDropFromToolbox(
  fabricCanvas: Canvas | null,
  documentRectangle: FabricImage | undefined
) {
  const journalContext = React.useContext(JournalContext);
  // Handle drag & drop from the photo toolbar
  const [_, drop] = useDrop(
    () => ({
      accept: THUMBNAIL_DRAG_ACCEPT_TYPE,
      drop: async ({ id }: ThumbnailDragParameteters) => {
        if (
          !fabricCanvas ||
          !documentRectangle ||
          !journalContext.journalId ||
          !journalContext.currentSpreadId
        ) {
          return;
        }
        const image = journalContext.loadedImages.find((i) => i.id === id);
        if (!image) {
          throw new Error('assertion error = image is not defined')
        }
        const fabricImage = await FabricImage.fromURL(image.dataUrl);
        fitFabricImageToRectangle(documentRectangle, fabricImage);
        addFabricImageToCanvas(fabricCanvas, fabricImage);

        const fabricJsMetadata = getFabricImageWithoutSrc(
          fabricCanvas,
          fabricImage
        );
        const spreadItem = await journalContext.addSpreadItem(image.id, fabricJsMetadata);
        augmentFabricImageWithSpreadItemMetadata(fabricImage, spreadItem);
      },
    }),
    [
      documentRectangle,
      fabricCanvas,
      journalContext
    ]
  );
  return drop;
}

export default useReceiveDragDropFromToolbox;

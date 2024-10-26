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
import { getPhotoById } from "@/helpers/indexdb";
import { augmentFabricImageWithSpreadItemMetadata } from "@/helpers/editable-object";
import { JournalContext } from "@/components/JournalContextProvider/JournalContextProvider";

function useReceiveDragDropFromToolbox(
  fabricCanvas: Canvas | null,
  documentRectangle: FabricImage | undefined
) {
  const { journalId, currentSpreadId, currentSpreadItems, addSpreadItem } =
    React.useContext(JournalContext);
  // Handle drag & drop from the photo toolbar
  const [_, drop] = useDrop(
    () => ({
      accept: THUMBNAIL_DRAG_ACCEPT_TYPE,
      drop: async ({ id }: ThumbnailDragParameteters) => {
        if (
          !fabricCanvas ||
          !documentRectangle ||
          !journalId ||
          !currentSpreadId
        ) {
          return;
        }
        const image = await getPhotoById(id);
        const fabricImage = await FabricImage.fromURL(image.dataUrl);
        fitFabricImageToRectangle(documentRectangle, fabricImage);
        addFabricImageToCanvas(fabricCanvas, fabricImage);

        const fabricJsMetadata = getFabricImageWithoutSrc(
          fabricCanvas,
          fabricImage
        );
        const spreadItem = await addSpreadItem(image.id, fabricJsMetadata);
        augmentFabricImageWithSpreadItemMetadata(fabricImage, spreadItem);
      },
    }),
    [
      documentRectangle,
      fabricCanvas,
      currentSpreadItems,
      journalId,
      currentSpreadId,
    ]
  );
  return drop;
}

export default useReceiveDragDropFromToolbox;

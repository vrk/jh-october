"use client";
import * as React from "react";
import Button from "@/components/Button";
import NavBar from "../NavBar";
import { FabricContext } from "../FabricContextProvider";
import { Canvas, ImageFormat } from "fabric";
import { BACKGROUND_ID_VALUE, PROPERTIES_TO_INCLUDE_IN_CLONES } from "@/helpers/editable-object";
import { jsPDF } from "jspdf";

type Props = {
  journalId: string;
};
function PrintLayoutNav({ journalId }: React.PropsWithoutRef<Props>) {
  const [fabricCanvas] = React.useContext(FabricContext);
  if (!fabricCanvas) {
    return <></>;
  }

  return (
    <NavBar>
      <Button onClick={() => printAllDocs(fabricCanvas)}>
        Print
      </Button>
      <Button key={journalId} href={`/journals/${journalId}`}>
        Back to spread
      </Button>
    </NavBar>
  );
}

async function printAllDocs(fabricCanvas: Canvas) {
  const clonedCanvas = await fabricCanvas.clone(
    PROPERTIES_TO_INCLUDE_IN_CLONES
  );

  const clonedBackgrounds = clonedCanvas
    .getObjects()
    .filter((o) => o.backgroundId?.startsWith(BACKGROUND_ID_VALUE));


  clonedCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  const pdf = new jsPDF({
    unit: "in",
    format: [8.5, 11]
  });
  for (let i = 0; i < clonedBackgrounds.length; i++) {
    const doc = clonedBackgrounds[i];
    const { top, left, width, height } = doc;
    const format: ImageFormat = "png";
    const options = {
      name: "New Image",
      format,
      quality: 1,
      width,
      height,
      left,
      top,
      multiplier: 1,
    };
    const dataUrl = clonedCanvas.toDataURL(options);
    if (i > 0) {
      pdf.addPage();
    }
    pdf.addImage(dataUrl, format, 0, 0, 8.5, 11, doc.backgroundId, 'NONE');
  }
  pdf.save('stuff.pdf');
}


export default PrintLayoutNav;

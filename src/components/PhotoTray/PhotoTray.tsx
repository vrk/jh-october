import * as React from "react";
import style from "./PhotoTray.module.css";
import { Canvas, FabricImage } from "fabric";
import { addFabricObjectToCanvas } from "@/helpers/canvas-helpers";
import { createNewImageResourceForJournal } from "@/helpers/indexdb";
import { FabricContext } from "../FabricContextProvider";
import { JournalContext } from "../JournalContextProvider/JournalContextProvider";
import { resolve } from "path";

function PhotoTray() {
  const [fabricCanvas] = React.useContext(FabricContext);
  const [journalId] = React.useContext(JournalContext);
  let button = <></>;
  if (fabricCanvas && journalId) {
    button = (
      <button onClick={() => onClickHandler(journalId, fabricCanvas)}>
        Import photos
      </button>
    );
  }

  return (
    <div className={style.container}>
      {button}
      <hr />
    </div>
  );
}

export default PhotoTray;

async function openFiles(): Promise<FileList | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.addEventListener("change", () => {
      // const file = input.files?.item(0);
      const { files } = input;
      if (!files) {
        resolve(null);
        return;
      }
      resolve(files);
    });
    input.click();
  });
}

function readFileInput(file: File): Promise<string> {
  return new Promise((resolve) => {
    const fileReader = new FileReader();
    fileReader.addEventListener("load", () => {
      resolve(fileReader.result as string);
    });
    fileReader.readAsDataURL(file);
  });
}

async function onClickHandler(journalId: string, canvas: Canvas) {
  const files = await openFiles();
  if (!files || files.length === 0) {
    return;
  }
  const promises = [];
  for (let i = 0; i < files?.length; i++) {
    const item = files.item(i);
    if (!item) {
      continue;
    }
    const promise = loadImage(journalId, canvas, item);
    promises.push(promise);
  }
  return Promise.all(promises);
}

async function loadImage(journalId: string, canvas: Canvas, file: File) {
  const [ dataUrl, thumbDataUrl] = await Promise.all([readFileInput(file), createThumbnail(file)]);
  if (!thumbDataUrl) {
    return;
  }
  return createNewImageResourceForJournal(journalId, dataUrl, thumbDataUrl);
  // const imageId = await createNewImageResourceForJournal(journalId, dataUrl, thumbDataUrl);
  // return addImageToCanvas(canvas, dataUrl, imageId);
}

async function addImageToCanvas(
  canvas: Canvas,
  dataUrl: string,
  imageId: string
) {
  const image = await FabricImage.fromURL(dataUrl);
  image.id = imageId;
  addFabricObjectToCanvas(canvas, image);
}

async function createImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const image = new Image();
    image.addEventListener("load", function () {
      resolve(image);
    });
    image.src = URL.createObjectURL(file);
  });
}

async function createThumbnail(file: File, targetWidth = 600): Promise<string|null> {
  const imageElement = await createImageElement(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }
  if (targetWidth < imageElement.width) {
    canvas.width = targetWidth;
    const scale = targetWidth / imageElement.width;
    canvas.height = imageElement.height * scale;
  } else {
    // Don't scale up
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
  }
  context.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

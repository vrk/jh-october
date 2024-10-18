import * as React from 'react';
import style from './PhotoTray.module.css';
import { Canvas, FabricImage } from "fabric";
import { addFabricObjectToCanvas } from '@/helpers/canvas-helpers';
import { createNewImageResource } from '@/helpers/indexdb';
import { FabricContext } from '../FabricContextProvider';

function PhotoTray() {

  const [fabricCanvas] = React.useContext(FabricContext);
  let button = <></>
  if (fabricCanvas) {
    button = <button onClick={() => onClickHandler(fabricCanvas)}>Add photo</button>
  }

  return <div className={style.container}>
    {button}
    <hr/>
  </div>;
}

export default PhotoTray;

async function openFiles(): Promise<FileList|null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = "image/*"
    input.multiple = true;
    input.addEventListener("change", () => {
      
      // const file = input.files?.item(0);
      const { files } = input;
      if (!files) {
        resolve(null);
        return;
      }
      resolve(files);
    })
    input.click();
  })
}

function readFileInput(file: File): Promise<string> {
  return new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.addEventListener('load', () => {
        resolve(fileReader.result as string)
      })
      fileReader.readAsDataURL(file);
  });
}

async function onClickHandler(canvas: Canvas) {
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
    const promise = loadImage(canvas, item);
    promises.push(promise);
  }
  return Promise.all(promises);
}

async function loadImage(canvas: Canvas, file: File) {
  const dataUrl = await readFileInput(file);
  const imageId = await createNewImageResource(dataUrl);
  return addImageToCanvas(canvas, dataUrl, imageId);
}

async function addImageToCanvas(canvas: Canvas, dataUrl: string, imageId: string) {
  const image = await FabricImage.fromURL(dataUrl);
  image.id = imageId;
  addFabricObjectToCanvas(canvas, image);
}


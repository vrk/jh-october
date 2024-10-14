import * as React from 'react';
import style from './PhotoTray.module.css';
import { Canvas, FabricImage } from "fabric";
import { addFabricObjectToCanvas } from '@/helpers/canvas-helpers';
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

async function openFile(): Promise<string|null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = "image/*"
    input.addEventListener("change", () => {
      const file = input.files?.item(0);
      if (!file) {
        resolve(null);
      }
      const fileReader = new FileReader();
      fileReader.addEventListener('load', () => {
        resolve(fileReader.result as string)
      })
      fileReader.readAsDataURL(file as File);
    })
    input.click();
  })
}

async function onClickHandler(canvas: Canvas) {
  const base64 = await openFile();
  if (!base64) {
    return; // canceled
  }
  const url = base64;
  await addImageToCanvas(canvas, url);
}

async function addImageToCanvas(canvas: Canvas, dataUrl: string) {
  const image = await FabricImage.fromURL(dataUrl);
  addFabricObjectToCanvas(canvas, image);
}


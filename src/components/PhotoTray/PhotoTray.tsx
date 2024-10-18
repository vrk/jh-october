import * as React from "react";
import style from "./PhotoTray.module.css";
import {
  createNewImageResourceForJournal,
  getImagesForJournal,
  JournalImage,
} from "@/helpers/indexdb";
import { FabricContext } from "../FabricContextProvider";
import { JournalContext } from "../JournalContextProvider/JournalContextProvider";
import PhotoTrayThumbnailList from "./components/PhotoTrayThumbnailList";
import DropdownSelect from "../DropdownSelect";
import * as ExifReader from 'exifreader';


type SortBy = "lastModified" | "importTime";

function PhotoTray() {
  const [fabricCanvas] = React.useContext(FabricContext);
  const [journalId] = React.useContext(JournalContext);

  // TODO: This is a lot of copies... Figure out if performance is miserable
  const [loadedImages, setLoadedImages] = React.useState<Array<JournalImage>>(
    []
  );
  const [selectedSortBy, setSelectedSortBy] =
    React.useState<SortBy>("importTime");

  React.useEffect(() => {
    if (!journalId) {
      return;
    }
    getImagesForJournal(journalId).then((loadedImages) => {
      console.log("loaded", loadedImages);
      setLoadedImages(loadedImages);
    });
  }, [journalId, setLoadedImages]);

  // TODO: Make this its own component
  let button = <></>;
  if (fabricCanvas && journalId) {
    const onImportPhotoButtonClick = async () => {
      const files = await openFiles();
      if (!files || files.length === 0) {
        return;
      }
      const images = await importFiles(files, journalId);
      setLoadedImages([...loadedImages, ...images]);
    };
    button = <button onClick={onImportPhotoButtonClick}>Import photos</button>;
  }

  sortImages(selectedSortBy, loadedImages);
  return (
    <div className={style.container}>
      <DropdownSelect<SortBy>
        defaultValue={"importTime"}
        title={"Sort By"}
        value={selectedSortBy}
        onValueChanged={(value: SortBy) => {
          setSelectedSortBy(value);
        }}
        optionList={[
          {
            value: "importTime",
            title: "Import Time",
          },
          {
            value: "lastModified",
            title: "Last Modified",
          },
        ]}
      ></DropdownSelect>
      {button}
      <hr />
      <PhotoTrayThumbnailList
        images={loadedImages}
        setImages={setLoadedImages}
      ></PhotoTrayThumbnailList>
    </div>
  );
}

export default PhotoTray;

function sortImages(sortType: SortBy, images: Array<JournalImage>) {
  switch(sortType) {
    case "lastModified":
      images.sort((a, b) => {
        return b.lastModified - a.lastModified
      })
      return;
    case "importTime":
      images.sort((a, b) => {
        return b.importTime - a.importTime
      })
      return;
  }
}

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

async function importFiles(
  files: FileList,
  journalId: string
): Promise<Array<JournalImage>> {
  const promises = [];
  for (let i = 0; i < files.length; i++) {
    const item = files.item(i);
    if (!item) {
      continue;
    }
    const promise = importImage(journalId, item);
    promises.push(promise);
  }
  const images = await Promise.all(promises);
  return images.filter((i) => i !== null);
}

async function importImage(
  journalId: string,
  file: File
): Promise<JournalImage | null> {
  const [dataUrl, imageElement, tags] = await Promise.all([
    readFileInput(file),
    createImageElement(file),
    ExifReader.load(file, {async: true})
  ]);
  const thumbnail = createThumbnail(imageElement);
  if (!thumbnail) {
    return null;
  }
  if (tags) {
    const imageDate = tags['DateTimeOriginal']?.description;
    const unprocessedTagValue = tags['DateTimeOriginal']?.value;
    if (imageDate) {
      // TODO: FIX HACK!!!!
      let hackedDate = imageDate.replace(':', "-");
      hackedDate = hackedDate.replace(':', '-');
      console.log('tags', hackedDate, Date.parse(hackedDate));
    }
  }
  const imageInfo = {
    id: "", // HACK to make typescript compiler happy -_-
    lastModified: file.lastModified,
    importTime: Date.now(),
    journalId,
    dataUrl,
    width: imageElement.width,
    height: imageElement.height,
    thumbDataUrl: thumbnail.data,
    thumbHeight: thumbnail.height,
    thumbWidth: thumbnail.width,
  };
  const imageId = await createNewImageResourceForJournal(imageInfo);
  imageInfo.id = imageId;
  return imageInfo;
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

type Thumbnail = {
  data: string;
  height: number;
  width: number;
};

function createThumbnail(
  imageElement: HTMLImageElement,
  targetWidth = 600
): Thumbnail | null {
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
  return {
    data: canvas.toDataURL("image/png"),
    height: canvas.height,
    width: canvas.width,
  };
}

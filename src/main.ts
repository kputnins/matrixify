import "./style.css";

const fileInput = document.getElementById("image-input") as HTMLInputElement;
const canvasBefore = document.getElementById(
  "canvas-before",
) as HTMLCanvasElement;
const canvasAfter = document.getElementById(
  "canvas-after",
) as HTMLCanvasElement;

const ctxBefore = canvasBefore.getContext("2d");
const ctxAfter = canvasAfter.getContext("2d");

if (ctxBefore === null || ctxAfter === null) {
  throw new Error("Failed to get canvas context");
}

const drawImage = (
  image: HTMLImageElement,
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
) => {
  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0);
};

const onImageLoad = async (image: HTMLImageElement) => {
  drawImage(image, ctxBefore, canvasBefore);

  const imageData = ctxBefore.getImageData(0, 0, image.width, image.height);
  if (imageData) {
    const processedImage = await processImage(imageData.data);
    drawImage(processedImage, ctxAfter, canvasAfter);
  }
};

const processImage = (
  imageData: Uint8ClampedArray<ArrayBufferLike>,
): Promise<HTMLImageElement> => {
  console.log(imageData); // Uint8ClampedArray of RGBA

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);

    // Convert Uint8ClampedArray to Blob
    const blob = new Blob([imageData], { type: "image/png" });
    image.src = URL.createObjectURL(blob);
    console.log("Image source set to:", image.src);
  });
};

const main = () => {
  fileInput.addEventListener("change", (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => onImageLoad(image);
  });

  document.addEventListener("paste", (e) => {
    const items = e.clipboardData?.items;
    console.log("Paste event detected", items);
    if (!items) return;

    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile();
        if (!blob) return;

        const image = new Image();
        image.src = URL.createObjectURL(blob);
        image.onload = () => onImageLoad(image);
      }
    }
  });
};

main();

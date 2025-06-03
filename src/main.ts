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

const onImageLoad = (image: HTMLImageElement) => {
  drawImage(image, ctxBefore, canvasBefore);

  const imageData = ctxBefore.getImageData(0, 0, image.width, image.height);
  if (imageData) {
    const processedImage = processImage(imageData);
    canvasAfter.width = processedImage.width;
    canvasAfter.height = processedImage.height;
    ctxAfter.putImageData(processedImage, 0, 0);
  }
};

const processImage = (imageData: ImageData): ImageData => {
  const newImageData = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height,
  );

  const data = newImageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const blockSize = 16;

  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      let rTotal = 0,
        gTotal = 0,
        bTotal = 0,
        pixelCount = 0;

      // Iterate over each pixel in this 16x16 block
      for (let dy = 0; dy < blockSize; dy++) {
        for (let dx = 0; dx < blockSize; dx++) {
          const px = x + dx;
          const py = y + dy;

          if (px >= width || py >= height) continue;

          const i = (py * width + px) * 4;
          rTotal += data[i];
          gTotal += data[i + 1];
          bTotal += data[i + 2];
          pixelCount++;
        }
      }

      const rAvg = Math.round(rTotal / pixelCount);
      const gAvg = Math.round(gTotal / pixelCount);
      const bAvg = Math.round(bTotal / pixelCount);

      // Calculate relative luminance per block
      // Formula: 0.2126*R + 0.7152*G + 0.0722*B
      const luminance =
        ((0.2126 * rAvg + 0.7152 * gAvg + 0.0722 * bAvg) / 255) * 100;

      console.log(
        `Block (${x}, ${y}): RGB(${rAvg}, ${gAvg}, ${bAvg}) | Lum: ${luminance.toFixed(2)}`,
      );

      // Apply the average color back to each pixel in the block
      for (let dy = 0; dy < blockSize; dy++) {
        for (let dx = 0; dx < blockSize; dx++) {
          const px = x + dx;
          const py = y + dy;

          if (px >= width || py >= height) continue;

          const i = (py * width + px) * 4;
          data[i] = rAvg;
          data[i + 1] = gAvg;
          data[i + 2] = bAvg;
          // Leave Alpha alone unless you're a monster
        }
      }
    }
  }

  return newImageData;
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

// ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ012345789":・.=*+-<>¦｜&çﾘｸ日

import "./style.css";

const alphabet =
  "日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ012345789\":・.=*+-<>¦｜&çﾘｸ/\\_@#WMB8%$QAXPSEFCGZVJLTI?+=~^_-,:'`.";

const fileInput = document.getElementById("image-input") as HTMLInputElement;
const blockSizeInput = document.getElementById(
  "block-size",
) as HTMLInputElement;
const fontSizeInput = document.getElementById("font-size") as HTMLInputElement;
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

if (!blockSizeInput || !fontSizeInput) {
  throw new Error("Failed to get input elements");
}

let BLOCK_SIZE = blockSizeInput.valueAsNumber || 16; // Default to 16 if not set
let FONT_SIZE = fontSizeInput.valueAsNumber || 16; // Default to 16 if not set

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

    canvasAfter.width = processedImage[0].length * FONT_SIZE;
    canvasAfter.height = processedImage.length * FONT_SIZE;

    ctxAfter.fillRect(0, 0, canvasAfter.width, canvasAfter.height);

    processedImage.forEach((line, y) => {
      line.forEach((character, x) => {
        ctxAfter.save();
        ctxAfter.font = `${FONT_SIZE}px monospace`;
        ctxAfter.fillStyle = character.rgb;
        ctxAfter.textAlign = "center";
        ctxAfter.textBaseline = "middle";
        ctxAfter.shadowColor = character.rgb;
        ctxAfter.shadowBlur = 8;
        ctxAfter.fillText(
          character.char,
          x * FONT_SIZE + FONT_SIZE / 2,
          y * FONT_SIZE + FONT_SIZE / 2,
        );
        ctxAfter.restore();
      });
    });

    canvasBefore.style.height = "45vh";
    canvasAfter.style.height = "45vh";
  }
};

type Character = { char: string; rgb: string };
type Line = Character[];
type Image = Line[];

const processImage = (imageData: ImageData): Image => {
  const newImageData = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height,
  );

  const data = newImageData.data;
  const width = imageData.width;
  const height = imageData.height;

  const image: Image = [];

  for (let y = 0; y < height; y += BLOCK_SIZE) {
    const line: Line = [];
    image.push(line);

    for (let x = 0; x < width; x += BLOCK_SIZE) {
      let rTotal = 0,
        gTotal = 0,
        bTotal = 0,
        pixelCount = 0;

      // Iterate over each pixel in this 16x16 block
      for (let dy = 0; dy < BLOCK_SIZE; dy++) {
        for (let dx = 0; dx < BLOCK_SIZE; dx++) {
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

      // Get alphabet character for this block
      const index = Math.floor(luminance); // 0-99
      const character = alphabet[index];

      line.push({
        char: character,
        rgb: `rgb(${rAvg}, ${gAvg}, ${bAvg})`,
      });
    }
  }

  return image;
};

const main = () => {
  fileInput.addEventListener("change", (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => onImageLoad(image);
  });

  fontSizeInput.addEventListener("input", (event) => {
    FONT_SIZE = (event.target as HTMLInputElement).valueAsNumber || 16;
    console.log("Font size changed to:", FONT_SIZE);
  });

  blockSizeInput.addEventListener("input", (event) => {
    BLOCK_SIZE = (event.target as HTMLInputElement).valueAsNumber || 16;
    console.log("Block size changed to:", BLOCK_SIZE);
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

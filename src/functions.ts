import { RGBA } from "@/types";

export function applyImageToCanvas(
  imageData: ImageData | null,
  canvas: HTMLCanvasElement
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (!imageData) {
    canvas.width = DEFAULT_WIDTH;
    canvas.height = DEFAULT_HEIGHT;
    canvas.style.height = "";
  } else {
    const box = canvas.getBoundingClientRect();
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
    canvas.style.height = `${
      (imageData.height * box.width) / imageData.width
    }px`;
  }
}
// 44%
export function stringToRGBA(rgba: string) {
  const [r, g, b, a] = rgba.match(/\d+/g)?.map(Number) ?? [0, 0, 0, 1];
  // TODO: use a color lib to handle all types of color strings
  return [r, g, b, a * 255] as RGBA;
}

export function swapColors(
  imageData: ImageData | null,
  inputColor: RGBA,
  outputColor: RGBA,
  tolerance: number,
  preserveShades: boolean
) {
  if (!imageData) return null;
  const [ir, ig, ib] = inputColor;
  const [or, og, ob] = outputColor;
  // Create copy of image data to modify
  const newImageData = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );

  // Process each pixel
  for (let i = 0; i < newImageData.data.length; i += 4) {
    const r = newImageData.data[i];
    const g = newImageData.data[i + 1];
    const b = newImageData.data[i + 2];

    // Calculate color difference using Euclidean distance
    const diff =
      Math.sqrt(
        Math.pow((r - ir) / 255, 2) +
          Math.pow((g - ig) / 255, 2) +
          Math.pow((b - ib) / 255, 2)
      ) / Math.sqrt(3);

    // If color is within tolerance, swap it
    if (diff <= tolerance) {
      if (preserveShades) {
        // Calculate ratio between input and current pixel colors
        const rRatio = ir === 0 ? 0 : r / ir;
        const gRatio = ig === 0 ? 0 : g / ig;
        const bRatio = ib === 0 ? 0 : b / ib;

        // Apply ratio to output color
        newImageData.data[i] = Math.round(or * rRatio);
        newImageData.data[i + 1] = Math.round(og * gRatio);
        newImageData.data[i + 2] = Math.round(ob * bRatio);
      } else {
        newImageData.data[i] = or;
        newImageData.data[i + 1] = og;
        newImageData.data[i + 2] = ob;
      }
    }
  }
  return newImageData;
}

const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 150;

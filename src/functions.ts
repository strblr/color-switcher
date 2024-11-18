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

const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 150;

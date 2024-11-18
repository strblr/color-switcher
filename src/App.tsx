import { useEffect, useRef, useState } from "react";
import { Button } from "@nextui-org/react";
import { applyImageToCanvas } from "@/functions";

export function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const dataRef = useRef<HTMLCanvasElement>(null);
  const outputRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<ImageData | null>(null);
  const [output, setOutput] = useState<ImageData | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = () => {
        const canvas = new OffscreenCanvas(image.width, image.height);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(image, 0, 0);
          const imageData = ctx.getImageData(0, 0, image.width, image.height);
          setData(imageData);
          setOutput(imageData);
        }
        URL.revokeObjectURL(image.src);
      };
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    setData(null);
    setOutput(null);
  };

  useEffect(() => {
    dataRef.current && applyImageToCanvas(data, dataRef.current);
  }, [data]);

  useEffect(() => {
    outputRef.current && applyImageToCanvas(output, outputRef.current);
  }, [output]);

  return (
    <div className="container py-4">
      <h1 className="text-6xl font-bold tracking-tighter text-center bg-gradient-to-b from-white to-primary/60 bg-clip-text text-transparent">
        Color Switcher
      </h1>
      <div className="mt-16 flex justify-center gap-4">
        <Button
          size="lg"
          color="primary"
          onClick={() => inputRef.current?.click()}
        >
          Upload PNG
        </Button>
        <Button
          size="lg"
          color="danger"
          variant="flat"
          isDisabled={!data && !output}
          onClick={handleClear}
        >
          Clear
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple={false}
        accept="image/png"
        className="hidden"
        onChange={handleUpload}
      />
      <div className="flex gap-4 mt-4">
        <canvas
          ref={dataRef}
          className="flex-1 min-w-0 border border-dashed border-white/30 rounded-lg bg-[url('/transparency.png')]"
        />
        <canvas
          ref={outputRef}
          className="flex-1 min-w-0 border border-dashed border-white/30 rounded-lg bg-[url('/transparency.png')]"
        />
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, MouseEvent } from "react";
import { Button, Checkbox, Input, Slider } from "@nextui-org/react";
import { applyImageToCanvas, stringToRGBA, swapColors } from "@/functions";

export function App() {
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLCanvasElement>(null);
  const outputRef = useRef<HTMLCanvasElement>(null);
  const [input, setInput] = useState<ImageData | null>(null);
  const [output, setOutput] = useState<ImageData | null>(null);
  const [inputColor, setInputColor] = useState("rgba(0,0,0,0)");
  const [outputColor, setOutputColor] = useState("rgba(0,0,0,0)");
  const [tolerance, setTolerance] = useState(0.1);
  const [preserveShades, setPreserveShades] = useState(true);

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
          setInput(imageData);
          setOutput(imageData);
        }
        URL.revokeObjectURL(image.src);
      };
      if (fileUploadRef.current) {
        fileUploadRef.current.value = "";
      }
    }
  };

  const handleReset = () => {
    setInput(null);
    setOutput(null);
    setInputColor("rgba(0,0,0,0)");
    setOutputColor("rgba(0,0,0,0)");
    setTolerance(0.1);
    setPreserveShades(true);
  };

  const handleColorPick = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const imageData = ctx.getImageData(x, y, 1, 1);
      const data = imageData.data;
      setInputColor(`rgba(${data[0]},${data[1]},${data[2]},${data[3] / 255})`);
    }
  };

  const handleSwap = () => {
    setOutput(
      swapColors(
        input,
        stringToRGBA(inputColor),
        stringToRGBA(outputColor),
        tolerance,
        preserveShades
      )
    );
  };

  const handleSaveAsOriginal = () => {
    setInput(output);
  };

  const handleDownload = async () => {
    if (!output) return;
    const canvas = new OffscreenCanvas(output.width, output.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(output, 0, 0);
    const blob = await canvas.convertToBlob({ type: "image/png" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  useEffect(() => {
    inputRef.current && applyImageToCanvas(input, inputRef.current);
  }, [input]);

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
          onClick={() => fileUploadRef.current?.click()}
        >
          Upload PNG
        </Button>
        <Button size="lg" color="danger" variant="flat" onClick={handleReset}>
          Reset
        </Button>
      </div>
      <input
        ref={fileUploadRef}
        type="file"
        multiple={false}
        accept="image/png"
        className="hidden"
        onChange={handleUpload}
      />
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-center mb-1">Original</h3>
          <canvas
            ref={inputRef}
            onClick={handleColorPick}
            className="w-full border border-dashed border-white/30 rounded-lg bg-[url('/transparency.png')]"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-center mb-1">Output</h3>
          <canvas
            ref={outputRef}
            className="w-full border border-dashed border-white/30 rounded-lg bg-[url('/transparency.png')]"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-start gap-4 mt-16">
        <div className="flex-1 min-w-0">
          <div className="flex gap-2">
            <div
              className="w-14 h-14 rounded-lg border border-white/30"
              style={{ backgroundColor: inputColor }}
            />
            <Input
              label="Replace this color"
              value={inputColor}
              onValueChange={setInputColor}
              description="Type a color or pick it from the image"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <div
              className="w-14 h-14 rounded-lg border border-white/30"
              style={{ backgroundColor: outputColor }}
            />
            <Input
              label="With this color"
              value={outputColor}
              onValueChange={setOutputColor}
              description="Type a color"
            />
          </div>
          <Slider
            label="Tolerance"
            value={tolerance}
            onChange={value => setTolerance(value as number)}
            minValue={0}
            maxValue={1}
            step={0.01}
            formatOptions={{ style: "percent" }}
            className="mt-2"
          />
          <Checkbox
            isSelected={preserveShades}
            onValueChange={setPreserveShades}
            className="mt-2"
          >
            Preserve shades
          </Checkbox>
        </div>
        <div className="flex-1 min-w-0 flex gap-2 flex-wrap">
          <Button size="lg" color="secondary" onClick={handleSwap}>
            Swap colors
          </Button>
          <Button size="lg" onClick={handleSaveAsOriginal}>
            Save output as original
          </Button>
          <Button size="lg" color="primary" onClick={handleDownload}>
            Download output
          </Button>
        </div>
      </div>
    </div>
  );
}

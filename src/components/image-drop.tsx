import { ImageUp } from "lucide-react";
import { useRef, useState } from "react";
import { ACCEPTED_TYPES } from "@/lib/image";
import { cn } from "@/lib/utils";

export function ImageDrop({ onFile, fileName }: { onFile: (f: File) => void; fileName?: string | undefined }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className={cn("rounded-xl border-2 border-dashed p-6 text-center transition-colors sm:p-8", over ? "border-primary bg-primary-soft" : "border-input")}
    >
      <ImageUp className="mx-auto h-8 w-8 text-primary" aria-hidden />
      <p className="mt-3 text-sm text-muted-foreground">
        {fileName ? <>Selected: <strong className="break-all text-foreground">{fileName}</strong></> : "Drag an image here, or"}
      </p>
      <label htmlFor="image-input" className="mt-3 inline-flex h-11 cursor-pointer items-center rounded-md bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-within:outline-2">
        {fileName ? "Choose another image" : "Choose image"}
      </label>
      <input
        ref={input}
        id="image-input"
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <p className="mt-3 text-xs text-muted-foreground">JPG, PNG, WebP, GIF (first frame), BMP or AVIF · up to 25 MB</p>
    </div>
  );
}

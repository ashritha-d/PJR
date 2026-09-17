"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Upload, X, Loader2, Plus } from "lucide-react";

export function MultiImageUploader({
  value,
  onChange,
  folder = "products",
  label = "Product Images",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setLoading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) uploaded.push(data.url);
      else toast.error(data.error ?? "Upload failed");
    }
    setLoading(false);
    onChange([...value, ...uploaded]);
  }

  return (
    <div>
      <label className="label-field">{label}</label>
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div key={url + i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-forest-200 bg-forest-50">
            <Image src={url} alt={`Image ${i + 1}`} fill sizes="80px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-forest-200 text-forest-400 hover:border-forest-400"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          <span className="text-[10px]">Add</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      <p className="mt-1.5 flex items-center gap-1 text-xs text-forest-400">
        <Upload size={12} /> First image is used as the primary product image.
      </p>
    </div>
  );
}

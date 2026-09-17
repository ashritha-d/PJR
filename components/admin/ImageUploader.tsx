"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Upload, X, Loader2 } from "lucide-react";

export function ImageUploader({
  value,
  onChange,
  folder = "products",
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? "Upload failed");
      return;
    }
    onChange(data.url);
  }

  return (
    <div>
      <label className="label-field">{label}</label>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-forest-200 bg-forest-50">
            <Image src={value} alt="Preview" fill sizes="80px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-forest-200 text-forest-300">
            <Upload size={20} />
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="btn-secondary !py-2 !text-xs"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {value ? "Change" : "Upload"} Image
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

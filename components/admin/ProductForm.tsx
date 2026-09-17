"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { productSchema } from "@/lib/validations";
import { MultiImageUploader } from "@/components/admin/MultiImageUploader";

type Category = { id: string; name: string };

export type ProductFormValues = {
  name: string;
  categoryId: string;
  subcategory: string;
  description: string;
  farmSource: string;
  storageInstructions: string;
  deliveryInfo: string;
  price: string;
  discountPrice: string;
  sku: string;
  stock: string;
  unit: string;
  weight: string;
  isFeatured: boolean;
  status: "ACTIVE" | "INACTIVE";
  images: string[];
};

export function ProductForm({
  categories,
  initial,
  productId,
}: {
  categories: Category[];
  initial?: ProductFormValues;
  productId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormValues>(
    initial ?? {
      name: "",
      categoryId: categories[0]?.id ?? "",
      subcategory: "",
      description: "",
      farmSource: "",
      storageInstructions: "",
      deliveryInfo: "",
      price: "",
      discountPrice: "",
      sku: "",
      stock: "",
      unit: "",
      weight: "",
      isFeatured: false,
      status: "ACTIVE",
      images: [],
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name: form.name,
      categoryId: form.categoryId,
      subcategory: form.subcategory || null,
      description: form.description,
      farmSource: form.farmSource || null,
      storageInstructions: form.storageInstructions || null,
      deliveryInfo: form.deliveryInfo || null,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      sku: form.sku,
      stock: Number(form.stock),
      unit: form.unit,
      weight: form.weight || null,
      isFeatured: form.isFeatured,
      status: form.status,
      images: form.images,
    };

    const parsed = productSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fieldErrors[i.path[0] as string] = i.message));
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setLoading(true);

    const res = await fetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
      method: productId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? "Something went wrong");
      return;
    }

    toast.success(productId ? "Product updated" : "Product created");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card space-y-4 p-6">
        <h3 className="font-display font-bold text-forest-800">Basic Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field">Product Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className="label-field">Category</label>
            <select className="input-field" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId}</p>}
          </div>
        </div>
        <div>
          <label className="label-field">Subcategory (optional)</label>
          <input className="input-field" value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Description</label>
          <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h3 className="font-display font-bold text-forest-800">Farm &amp; Delivery Details</h3>
        <div>
          <label className="label-field">Farm Source (optional)</label>
          <input className="input-field" value={form.farmSource} onChange={(e) => setForm({ ...form, farmSource: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Storage Instructions (optional)</label>
          <input className="input-field" value={form.storageInstructions} onChange={(e) => setForm({ ...form, storageInstructions: e.target.value })} />
        </div>
        <div>
          <label className="label-field">Delivery Information (optional)</label>
          <input className="input-field" value={form.deliveryInfo} onChange={(e) => setForm({ ...form, deliveryInfo: e.target.value })} />
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h3 className="font-display font-bold text-forest-800">Pricing &amp; Inventory</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label-field">Price (₹)</label>
            <input type="number" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
          </div>
          <div>
            <label className="label-field">Discount Price (₹, optional)</label>
            <input type="number" className="input-field" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
          </div>
          <div>
            <label className="label-field">SKU</label>
            <input className="input-field" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku}</p>}
          </div>
          <div>
            <label className="label-field">Stock Quantity</label>
            <input type="number" className="input-field" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
          </div>
          <div>
            <label className="label-field">Unit (e.g. 1 Kg, 12 Eggs)</label>
            <input className="input-field" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            {errors.unit && <p className="mt-1 text-xs text-red-600">{errors.unit}</p>}
          </div>
          <div>
            <label className="label-field">Weight (optional)</label>
            <input className="input-field" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          </div>
        </div>
        <div className="flex flex-wrap gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm text-forest-600">
            <input type="checkbox" className="accent-forest-700" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            Featured Product
          </label>
          <label className="flex items-center gap-2 text-sm text-forest-600">
            <input type="checkbox" className="accent-forest-700" checked={form.status === "ACTIVE"} onChange={(e) => setForm({ ...form, status: e.target.checked ? "ACTIVE" : "INACTIVE" })} />
            Active (visible to customers)
          </label>
        </div>
      </div>

      <div className="card p-6">
        <MultiImageUploader value={form.images} onChange={(images) => setForm({ ...form, images })} />
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {productId ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  );
}

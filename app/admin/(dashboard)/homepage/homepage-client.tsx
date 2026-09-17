"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ICON_MAP } from "@/lib/icon-map";

type WhyChooseItem = { icon: string; title: string; description: string };
type Testimonial = { name: string; location: string; rating: number; comment: string };
type HeroButton = { text: string; href: string };

export function HomepageClient() {
  const [heroHeading, setHeroHeading] = useState("");
  const [heroSubheading, setHeroSubheading] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [heroButtons, setHeroButtons] = useState<HeroButton[]>([]);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/homepage")
      .then((r) => r.json())
      .then((data) => {
        if (data.content) {
          setHeroHeading(data.content.heroHeading);
          setHeroSubheading(data.content.heroSubheading);
          setHeroImage(data.content.heroImage);
          setHeroButtons(JSON.parse(data.content.heroButtons));
          setWhyChooseUs(JSON.parse(data.content.whyChooseUs));
          setTestimonials(JSON.parse(data.content.testimonials));
        }
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/homepage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroHeading, heroSubheading, heroImage, heroButtons, whyChooseUs, testimonials }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save changes");
      return;
    }
    toast.success("Homepage content updated");
  }

  if (loading) return <div className="skeleton h-96" />;

  return (
    <div className="space-y-6">
      <div className="card space-y-4 p-6">
        <h3 className="font-display font-bold text-forest-800">Hero Banner</h3>
        <div>
          <label className="label-field">Hero Heading</label>
          <input className="input-field" value={heroHeading} onChange={(e) => setHeroHeading(e.target.value)} />
        </div>
        <div>
          <label className="label-field">Hero Description</label>
          <textarea className="input-field" rows={2} value={heroSubheading} onChange={(e) => setHeroSubheading(e.target.value)} />
        </div>
        <ImageUploader value={heroImage} onChange={setHeroImage} folder="banners" label="Hero Background Image (used when no banners are active)" />

        <div>
          <label className="label-field">Hero Buttons</label>
          <div className="space-y-2">
            {heroButtons.map((b, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input-field"
                  placeholder="Button text"
                  value={b.text}
                  onChange={(e) => setHeroButtons(heroButtons.map((x, idx) => (idx === i ? { ...x, text: e.target.value } : x)))}
                />
                <input
                  className="input-field"
                  placeholder="Link (e.g. /products)"
                  value={b.href}
                  onChange={(e) => setHeroButtons(heroButtons.map((x, idx) => (idx === i ? { ...x, href: e.target.value } : x)))}
                />
                <button type="button" onClick={() => setHeroButtons(heroButtons.filter((_, idx) => idx !== i))} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setHeroButtons([...heroButtons, { text: "", href: "" }])} className="btn-secondary !py-2 !text-xs">
              <Plus size={14} /> Add Button
            </button>
          </div>
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h3 className="font-display font-bold text-forest-800">Why Choose Us</h3>
        {whyChooseUs.map((item, i) => (
          <div key={i} className="grid gap-2 rounded-2xl border border-forest-100 p-4 sm:grid-cols-[140px_1fr_1fr_auto]">
            <select
              className="input-field"
              value={item.icon}
              onChange={(e) => setWhyChooseUs(whyChooseUs.map((x, idx) => (idx === i ? { ...x, icon: e.target.value } : x)))}
            >
              {Object.keys(ICON_MAP).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <input
              className="input-field"
              placeholder="Title"
              value={item.title}
              onChange={(e) => setWhyChooseUs(whyChooseUs.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))}
            />
            <input
              className="input-field"
              placeholder="Description"
              value={item.description}
              onChange={(e) => setWhyChooseUs(whyChooseUs.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x)))}
            />
            <button type="button" onClick={() => setWhyChooseUs(whyChooseUs.filter((_, idx) => idx !== i))} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setWhyChooseUs([...whyChooseUs, { icon: "Leaf", title: "", description: "" }])}
          className="btn-secondary !py-2 !text-xs"
        >
          <Plus size={14} /> Add Item
        </button>
      </div>

      <div className="card space-y-4 p-6">
        <h3 className="font-display font-bold text-forest-800">Testimonials</h3>
        {testimonials.map((t, i) => (
          <div key={i} className="space-y-2 rounded-2xl border border-forest-100 p-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <input className="input-field" placeholder="Name" value={t.name} onChange={(e) => setTestimonials(testimonials.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))} />
              <input className="input-field" placeholder="Location" value={t.location} onChange={(e) => setTestimonials(testimonials.map((x, idx) => (idx === i ? { ...x, location: e.target.value } : x)))} />
              <input type="number" min={1} max={5} className="input-field" placeholder="Rating (1-5)" value={t.rating} onChange={(e) => setTestimonials(testimonials.map((x, idx) => (idx === i ? { ...x, rating: Number(e.target.value) } : x)))} />
            </div>
            <textarea className="input-field" rows={2} placeholder="Comment" value={t.comment} onChange={(e) => setTestimonials(testimonials.map((x, idx) => (idx === i ? { ...x, comment: e.target.value } : x)))} />
            <button type="button" onClick={() => setTestimonials(testimonials.filter((_, idx) => idx !== i))} className="flex items-center gap-1 text-xs font-medium text-red-500">
              <Trash2 size={14} /> Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setTestimonials([...testimonials, { name: "", location: "", rating: 5, comment: "" }])}
          className="btn-secondary !py-2 !text-xs"
        >
          <Plus size={14} /> Add Testimonial
        </button>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving && <Loader2 size={16} className="animate-spin" />}
          Save Homepage Content
        </button>
      </div>
    </div>
  );
}

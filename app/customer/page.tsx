"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

const PRESETS = [
  {
    location: "canada", brand: "celine", style: "Classic Box", year: "2020",
    placeOfPurchase: "Celine Boutique", retailPrice: "3200", size: "Medium",
    colours: ["Black"], materials: ["Smooth Leather"], hardware: ["Gold"],
    condition: "9.5/10 (some minor flaws)", inclusions: "Dustbag, box", lendQuote: false,
    mainImageUrl: "/preset-1.jpg",
  },
  {
    location: "us", brand: "chanel", style: "Classic Flap Medium", year: "2021",
    placeOfPurchase: "Chanel Boutique", retailPrice: "8800", size: "Medium",
    colours: ["Beige"], materials: ["Lambskin"], hardware: ["Gold"],
    condition: "9.5/10 (some minor flaws)", inclusions: "Dustbag, box, authenticity card", lendQuote: true,
    mainImageUrl: "/preset-2.jpg",
  },
  {
    location: "us", brand: "saint-laurent", style: "Le 5 à 7", year: "2021",
    placeOfPurchase: "Saint Laurent Boutique", retailPrice: "1990", size: "Large",
    colours: ["Black"], materials: ["Smooth Leather"], hardware: ["Silver"],
    condition: "9.7/10 (like new)", inclusions: "Dustbag, box", lendQuote: false,
    mainImageUrl: "/preset-3.jpg",
  },
];

export default function CustomerPage() {
  const [location, setLocation] = useState("canada");
  const [brand, setBrand] = useState("");
  const [style, setStyle] = useState("");
  const [year, setYear] = useState("");
  const [placeOfPurchase, setPlaceOfPurchase] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [size, setSize] = useState("");
  const [colours, setColours] = useState([""]);
  const [materials, setMaterials] = useState([""]);
  const [hardware, setHardware] = useState([""]);
  const [condition, setCondition] = useState("");
  const [inclusions, setInclusions] = useState("");
  const [lendQuote, setLendQuote] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPreset, setIsUploadingPreset] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function applyPreset(index: number) {
    const p = PRESETS[index];
    setLocation(p.location); setBrand(p.brand); setStyle(p.style); setYear(p.year);
    setPlaceOfPurchase(p.placeOfPurchase); setRetailPrice(p.retailPrice); setSize(p.size);
    setColours(p.colours); setMaterials(p.materials); setHardware(p.hardware);
    setCondition(p.condition); setInclusions(p.inclusions); setLendQuote(p.lendQuote);
    setMainImageUrl(p.mainImageUrl); setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";

    setIsUploadingPreset(true);
    try {
      const res = await fetch(p.mainImageUrl);
      const blob = await res.blob();
      const file = new File([blob], `preset-${index + 1}.jpg`, { type: blob.type });
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/upload-image", { method: "POST", body: fd });
      const json = await uploadRes.json();
      if (json.url) setMainImageUrl(json.url);
    } catch {
      // preview stays as local path, upload failed silently
    } finally {
      setIsUploadingPreset(false);
    }
  }

  function setError(key: string, msg: string) {
    setErrors((prev) => ({ ...prev, [key]: msg }));
  }
  function clearError(key: string) {
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }
  function numericChange(value: string, setter: (v: string) => void, key: string) {
    const stripped = value.replace(/[^0-9.]/g, "");
    setter(stripped);
    if (value !== stripped) setError(key, "Only numbers are allowed");
    else clearError(key);
  }
  function charCount(value: string, max: number) {
    if (value.length < max - 5) return null;
    return (
      <span className={`text-xs self-end ${value.length >= max ? "text-destructive" : "text-muted-foreground"}`}>
        {value.length}/{max}
      </span>
    );
  }
  function addField(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((prev) => [...prev, ""]);
  }
  function updateField(setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) {
    setter((prev) => prev.map((v, i) => (i === index ? value : v)));
  }
  function removeField(setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) {
    setter((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationErrors: Record<string, string> = {};
    if (!brand) validationErrors.brand = "Brand is required";
    if (!style.trim()) validationErrors.style = "Style is required";
    if (!year.trim()) validationErrors.year = "Year is required";
    if (!mainImageUrl) validationErrors.mainImage = "A main image is required";
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    fetch(`${API_BASE}/intake`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({ id: Date.now(), location, brand, style, year, placeOfPurchase, retailPrice, size, condition, colours, materials, hardware, inclusions, lendQuote, mainImageUrl }),
    }).finally(() => setIsSubmitting(false));
    toast.success("Form submitted correctly");
    setLocation("canada");
    setBrand("");
    setStyle("");
    setYear("");
    setPlaceOfPurchase("");
    setRetailPrice("");
    setSize("");
    setColours([""]);
    setMaterials([""]);
    setHardware([""]);
    setCondition("");
    setInclusions("");
    setLendQuote(false);
    setMainImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold tracking-tight">Consign / Sell</h1>
      </div>

      <div className="max-w-md mx-auto w-full px-4 py-5 flex flex-col gap-5">
        <p className="text-sm text-muted-foreground">
          Fill out the form below and we will get back to you as soon as possible!
        </p>

        <div className="flex gap-2">
          {PRESETS.map((_, i) => (
            <Button key={i} type="button" variant="outline" size="sm" className="flex-1" disabled={isUploadingPreset} onClick={() => applyPreset(i)}>
              {isUploadingPreset ? "Loading..." : `Preset ${i + 1}`}
            </Button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Location */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Location</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="canada">Canada</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Canada and United States only.</p>
            </div>

            <p className="text-sm font-semibold -mb-2">Item Information</p>

            {/* Brand */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Brand</label>
              <Select value={brand} onValueChange={(v) => { setBrand(v); clearError("brand"); }}>
                <SelectTrigger><SelectValue placeholder="Select a Brand" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottega-veneta">Bottega Veneta</SelectItem>
                  <SelectItem value="celine">Celine</SelectItem>
                  <SelectItem value="chanel">Chanel</SelectItem>
                  <SelectItem value="christian-dior">Christian Dior</SelectItem>
                  <SelectItem value="fendi">Fendi</SelectItem>
                  <SelectItem value="gucci">Gucci</SelectItem>
                  <SelectItem value="louis-vuitton">Louis Vuitton</SelectItem>
                  <SelectItem value="prada">Prada</SelectItem>
                  <SelectItem value="saint-laurent">Saint Laurent</SelectItem>
                </SelectContent>
              </Select>
              {errors.brand && <span className="text-xs text-destructive">{errors.brand}</span>}
            </div>

            {/* Style */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Style</label>
              <Input placeholder="Style" value={style} maxLength={30} onChange={(e) => { setStyle(e.target.value); clearError("style"); }} />
              {errors.style && <span className="text-xs text-destructive">{errors.style}</span>}
              {charCount(style, 30)}
            </div>

            {/* Year */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Year</label>
              <Input placeholder="Year" value={year} maxLength={4} onChange={(e) => numericChange(e.target.value, setYear, "year")} />
              {errors.year && <span className="text-xs text-destructive">{errors.year}</span>}
            </div>

            {/* Place of Purchase */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Place of Purchase</label>
              <Input placeholder="Place of Purchase" value={placeOfPurchase} maxLength={30} onChange={(e) => setPlaceOfPurchase(e.target.value)} />
              {charCount(placeOfPurchase, 30)}
            </div>

            {/* Retail Price */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Retail Price</label>
              <Input placeholder="Retail Price" value={retailPrice} maxLength={30} onChange={(e) => numericChange(e.target.value, setRetailPrice, "retailPrice")} />
              {errors.retailPrice && <span className="text-xs text-destructive">{errors.retailPrice}</span>}
              {charCount(retailPrice, 30)}
            </div>

            {/* Size */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Size</label>
              <Input placeholder="Size" value={size} maxLength={30} onChange={(e) => setSize(e.target.value)} />
              {charCount(size, 30)}
            </div>

            {/* Colours */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Colour</label>
              {colours.map((val, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <Input placeholder="Colour" value={val} maxLength={30} onChange={(e) => updateField(setColours, i, e.target.value)} />
                    {colours.length > 1 && (
                      <button type="button" onClick={() => removeField(setColours, i)} className="text-muted-foreground hover:text-foreground shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {charCount(val, 30)}
                </div>
              ))}
              <button type="button" onClick={() => addField(setColours)} disabled={colours.length >= 8} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-1 w-fit disabled:opacity-40 disabled:cursor-not-allowed">
                <PlusCircle className="w-5 h-5" /> Add colour
              </button>
            </div>

            {/* Materials */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Material</label>
              {materials.map((val, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <Input placeholder="Material" value={val} maxLength={30} onChange={(e) => updateField(setMaterials, i, e.target.value)} />
                    {materials.length > 1 && (
                      <button type="button" onClick={() => removeField(setMaterials, i)} className="text-muted-foreground hover:text-foreground shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {charCount(val, 30)}
                </div>
              ))}
              <button type="button" onClick={() => addField(setMaterials)} disabled={materials.length >= 8} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-1 w-fit disabled:opacity-40 disabled:cursor-not-allowed">
                <PlusCircle className="w-5 h-5" /> Add material
              </button>
            </div>

            {/* Hardware */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Hardware</label>
              {hardware.map((val, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <Input placeholder="Hardware" value={val} maxLength={30} onChange={(e) => updateField(setHardware, i, e.target.value)} />
                    {hardware.length > 1 && (
                      <button type="button" onClick={() => removeField(setHardware, i)} className="text-muted-foreground hover:text-foreground shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {charCount(val, 30)}
                </div>
              ))}
              <button type="button" onClick={() => addField(setHardware)} disabled={hardware.length >= 8} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-1 w-fit disabled:opacity-40 disabled:cursor-not-allowed">
                <PlusCircle className="w-5 h-5" /> Add hardware
              </button>
            </div>

            {/* Condition */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Condition</label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger><SelectValue placeholder="Select a Condition" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="8/10 (average condition)">8/10 (average condition)</SelectItem>
                  <SelectItem value="8.5/10 (decent condition)">8.5/10 (decent condition)</SelectItem>
                  <SelectItem value="9/10 (some visible wear)">9/10 (some visible wear)</SelectItem>
                  <SelectItem value="9.5/10 (some minor flaws)">9.5/10 (some minor flaws)</SelectItem>
                  <SelectItem value="9.7/10 (like new)">9.7/10 (like new)</SelectItem>
                  <SelectItem value="10/10 (brand new)">10/10 (brand new)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Items rated 8 &amp; above accepted.</p>
            </div>

            {/* Inclusions */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Inclusions</label>
              <textarea
                placeholder="e.g. dustbag, box, receipt, card..."
                value={inclusions}
                maxLength={500}
                onChange={(e) => setInclusions(e.target.value)}
                className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              />
              {charCount(inclusions, 500)}
            </div>

            {/* Lend */}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="w-4 h-4 accent-orange-700" checked={lendQuote} onChange={(e) => setLendQuote(e.target.checked)} />
              I would also like a quote to lend this item.
            </label>

            <p className="text-sm font-semibold -mb-2">Photos</p>

            {/* Main Image */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Main Image</label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) { setMainImageUrl(null); return; }
                  if (file.size > 10 * 1024 * 1024) {
                    setError("mainImage", "Image must be under 10 MB.");
                    e.target.value = "";
                    return;
                  }
                  setMainImageUrl(URL.createObjectURL(file));
                  clearError("mainImage");
                  const fd = new FormData();
                  fd.append("file", file);
                  const res = await fetch("/api/upload-image", { method: "POST", body: fd });
                  const json = await res.json();
                  if (json.url) setMainImageUrl(json.url);
                  else setError("mainImage", "Image upload failed");
                }}
              />
              {errors.mainImage && <span className="text-xs text-destructive">{errors.mainImage}</span>}
              {mainImageUrl && (
                <img src={mainImageUrl} alt="preview" className="mt-2 w-32 h-32 object-cover rounded-md border border-border" />
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              By submitting, you agree that non-authentic items incur a mandatory $450.00 CAD fee per item to cover shipping and authentication costs.
            </p>

            <Button type="submit" className="w-full bg-orange-700 hover:bg-orange-800 text-white" disabled={isSubmitting || isUploadingPreset}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

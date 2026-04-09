"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import Link from "next/link";

const BRAND_LABELS: Record<string, string> = {
  "bottega-veneta": "Bottega Veneta",
  "celine": "Celine",
  "chanel": "Chanel",
  "christian-dior": "Christian Dior",
  "fendi": "Fendi",
  "gucci": "Gucci",
  "louis-vuitton": "Louis Vuitton",
  "prada": "Prada",
  "saint-laurent": "Saint Laurent",
};

type Submission = {
  id: number;
  location: string;
  brand: string;
  style: string;
  year: string;
  placeOfPurchase: string;
  retailPrice: string;
  size: string;
  condition: string;
  colours: string[];
  materials: string[];
  hardware: string[];
  inclusions: string;
  lendQuote: boolean;
  mainImageUrl: string | null;
  status?: string;
};

type QuoteResult = {
  brand: string;
  price_band: string;
  priceband_confidence: number | null;
  brand_confidence: number | null;
  needs_review: boolean;
  submitted_at: string;
};

function parseNumericId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function pickQuoteForIntake(payload: unknown, intakeId: number): QuoteResult | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const submissions = Array.isArray(record.submissions) ? record.submissions : [];
  if (submissions.length > 0) {
    const exact = submissions.find((entry) => {
      if (!entry || typeof entry !== "object") return false;
      const e = entry as Record<string, unknown>;
      const candidateId =
        parseNumericId(e.intake_id) ??
        parseNumericId(e.intakeId) ??
        parseNumericId(e.submission_id) ??
        parseNumericId(e.submissionId) ??
        parseNumericId(e.id);
      return candidateId === intakeId;
    });
    return ((exact ?? submissions[0]) as QuoteResult) ?? null;
  }
  if ("brand" in record || "price_band" in record || "needs_review" in record) {
    return record as unknown as QuoteResult;
  }
  return null;
}

const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

export default function SpecialistPage() {
  const [isFetching, setIsFetching] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [quoteResults, setQuoteResults] = useState<Record<number, QuoteResult | null>>({});
  const [loadingQuoteId, setLoadingQuoteId] = useState<number | null>(null);

  function fetchSubmissions(key: string) {
    if (!key) return;
    setIsFetching(true);
    fetch(`${API_BASE}/intakes/active`, { headers: { Authorization: `Bearer ${key}` } })
      .then((res) => res.json())
      .then((data) => {
        const mapped = (Array.isArray(data?.intakes) ? data.intakes : []).map((item: Record<string, unknown>) => ({
          ...item,
          placeOfPurchase: item.place_of_purchase ?? item.placeOfPurchase ?? "",
          retailPrice: item.retail_price ?? item.retailPrice ?? "",
          mainImageUrl: item.main_image_url ?? item.mainImageUrl ?? null,
          lendQuote: item.lend_quote ?? item.lendQuote ?? false,
          colours: item.colours ?? [],
          materials: item.materials ?? [],
          hardware: item.hardware ?? [],
        }));
        setSubmissions(mapped);
      })
      .catch(() => setSubmissions([]))
      .finally(() => setIsFetching(false));
  }

  useEffect(() => { fetchSubmissions(API_KEY); }, []);

  function fetchQuote(id: number) {
    setLoadingQuoteId(id);
    fetch(`${API_BASE}/submissions/${id}`, { headers: { Authorization: `Bearer ${API_KEY}` } })
      .then((r) => r.json())
      .then((data) => setQuoteResults((prev) => ({ ...prev, [id]: pickQuoteForIntake(data, id) })))
      .catch(() => setQuoteResults((prev) => ({ ...prev, [id]: null })))
      .finally(() => setLoadingQuoteId(null));
  }

  function removeSubmission(id: number) {
    fetch(`${API_BASE}/intake/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${API_KEY}` },
    }).then(() => {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      if (expandedId === id) setExpandedId(null);
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold tracking-tight">Pending Quotes</h1>
      </div>

      <div className="max-w-md mx-auto w-full px-4 py-5 flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Review and generate quotes for submitted consignment items.
        </p>

        {/* Submission Cards */}
        {submissions.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {"No pending submissions found."}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {submissions.map((s, index) => {
              const isExpanded = expandedId === s.id;
              const quote = quoteResults[s.id];
              return (
                <div key={s.id} className="rounded-xl border border-border bg-card overflow-hidden">
                  {/* Row */}
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 p-4 text-left"
                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  >
                    <span className="text-xs text-muted-foreground font-mono w-5 shrink-0">{submissions.length - index}</span>
                    {s.mainImageUrl
                      ? <img src={s.mainImageUrl} alt="item" className="w-10 h-10 object-cover rounded-md shrink-0" />
                      : <div className="w-10 h-10 rounded-md bg-muted shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{BRAND_LABELS[s.brand] ?? (s.brand || "—")}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.style || "—"} · {s.year || "—"}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                  </button>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="border-t border-border p-4 flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div><span className="text-muted-foreground">Location: </span>{s.location === "canada" ? "Canada" : "United States"}</div>
                        <div><span className="text-muted-foreground">Condition: </span>{s.condition || "—"}</div>
                        <div><span className="text-muted-foreground">Size: </span>{s.size || "—"}</div>
                        <div><span className="text-muted-foreground">Retail: </span>{s.retailPrice || "—"}</div>
                        <div><span className="text-muted-foreground">Colours: </span>{s.colours.filter(Boolean).join(", ") || "—"}</div>
                        <div><span className="text-muted-foreground">Materials: </span>{s.materials.filter(Boolean).join(", ") || "—"}</div>
                        <div><span className="text-muted-foreground">Hardware: </span>{s.hardware.filter(Boolean).join(", ") || "—"}</div>
                        <div><span className="text-muted-foreground">Lend Quote: </span>{s.lendQuote ? "Yes" : "No"}</div>
                        {s.placeOfPurchase && <div><span className="text-muted-foreground">Purchased: </span>{s.placeOfPurchase}</div>}
                        {s.inclusions && <div className="col-span-2"><span className="text-muted-foreground">Inclusions: </span>{s.inclusions}</div>}
                      </div>

                      {/* Quote result */}
                      {quote !== undefined && (
                        <div className="pt-3 border-t border-border">
                          <p className="text-sm font-semibold mb-2">Quote Result</p>
                          {quote === null ? (
                            <p className="text-sm text-destructive">Failed to fetch quote.</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                              <div><span className="text-muted-foreground">Brand: </span>{quote.brand || "—"}</div>
                              <div><span className="text-muted-foreground">Brand Conf.: </span>{quote.brand_confidence != null ? `${(quote.brand_confidence * 100).toFixed(1)}%` : "—"}</div>
                              <div><span className="text-muted-foreground">Price Band: </span>{quote.price_band || "—"}</div>
                              <div><span className="text-muted-foreground">Band Conf.: </span>{quote.priceband_confidence != null ? `${(quote.priceband_confidence * 100).toFixed(1)}%` : "—"}</div>
                              <div><span className="text-muted-foreground">Needs Review: </span>{quote.needs_review ? "Yes" : "No"}</div>
                              <div><span className="text-muted-foreground">Submitted: </span>{quote.submitted_at ? new Date(quote.submitted_at).toLocaleString() : "—"}</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {s.status === "needs_review" ? (
                          <Button size="sm" variant="destructive" disabled={loadingQuoteId === s.id} onClick={() => fetchQuote(s.id)}>
                            {loadingQuoteId === s.id ? "..." : "Review"}
                          </Button>
                        ) : s.status === "processed" || (quoteResults[s.id] !== undefined && quoteResults[s.id] !== null) ? (
                          <Button size="sm" variant="outline" disabled={loadingQuoteId === s.id} onClick={() => fetchQuote(s.id)}>
                            {loadingQuoteId === s.id ? "..." : "View"}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-orange-700 hover:bg-orange-800 text-white"
                            disabled={loadingQuoteId === s.id}
                            onClick={() => {
                              setLoadingQuoteId(s.id);
                              fetch(`${API_BASE}/generate-quote/${s.id}`, {
                                method: "POST",
                                headers: { Authorization: `Bearer ${API_KEY}` },
                              })
                                .then((r) => r.json())
                                .then((data) => setQuoteResults((prev) => ({ ...prev, [s.id]: data })))
                                .catch(() => setQuoteResults((prev) => ({ ...prev, [s.id]: null })))
                                .finally(() => setLoadingQuoteId(null));
                            }}
                          >
                            {loadingQuoteId === s.id ? "..." : "Generate"}
                          </Button>
                        )}
                        <button type="button" onClick={() => setDeleteTargetId(s.id)} className="ml-auto text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={deleteTargetId !== null} onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Submission</DialogTitle>
            <DialogDescription>Are you sure? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTargetId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteTargetId !== null) { removeSubmission(deleteTargetId); setDeleteTargetId(null); } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

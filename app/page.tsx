import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-10 bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Quotly</h1>
        <p className="text-sm text-muted-foreground">Select your view to continue</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Link
          href="/customer"
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-8 shadow-sm active:scale-[0.98] transition-transform"
        >
          <span className="text-4xl">🛍️</span>
          <div className="text-center">
            <p className="text-lg font-semibold">Customer</p>
            <p className="text-sm text-muted-foreground mt-1">Submit an item for consignment or sale</p>
          </div>
        </Link>

        <Link
          href="/specialist"
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-8 shadow-sm active:scale-[0.98] transition-transform"
        >
          <span className="text-4xl">🔍</span>
          <div className="text-center">
            <p className="text-lg font-semibold">Specialist</p>
            <p className="text-sm text-muted-foreground mt-1">Review and generate quotes for submissions</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

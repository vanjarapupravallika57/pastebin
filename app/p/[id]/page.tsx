import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function PastePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  /* -------- Deterministic time (TEST_MODE) -------- */
  let customNow: number | undefined;
  const headersList = headers();

  if (process.env.TEST_MODE === "1") {
    const h = headersList.get("x-test-now-ms");
    if (h) {
      const parsed = parseInt(h, 10);
      if (!isNaN(parsed)) customNow = parsed;
    }
  }

  /* -------- Build ABSOLUTE origin (FIX) -------- */
  const protocol =
    headersList.get("x-forwarded-proto") ?? "https";
  const host =
    headersList.get("x-forwarded-host") ??
    headersList.get("host");

  // if (!host) {
  //   notFound();
  // }
  if (!host) {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Paste not found or expired</h2>
      <p>This paste may have expired or exceeded view limit.</p>
    </div>
  );
}


  const origin = `${protocol}://${host}`;

  /* -------- Fetch API (ABSOLUTE URL) -------- */
  const res = await fetch(
    `${origin}/api/pastes/${id}`,
    {
      cache: "no-store",
      headers: customNow
        ? { "x-test-now-ms": customNow.toString() }
        : {},
    }
  );

  if (!res.ok) {
    notFound();
  }

  const paste = await res.json();

  if (!paste || typeof paste.content !== "string") {
    notFound();
  }

  /* -------- Safe date handling -------- */
  let timeRemaining: string | null = null;
  if (paste.expires_at) {
    const d = new Date(paste.expires_at);
    if (!isNaN(d.getTime())) {
      timeRemaining = formatDistanceToNow(d, { addSuffix: true });
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">
        Paste #{paste.id}
      </h1>

      <pre className="bg-gray-900 p-4 rounded text-gray-200 whitespace-pre-wrap">
        {paste.content}
      </pre>

      {paste.remaining_views !== null && (
        <p>{paste.remaining_views} views left</p>
      )}

      {timeRemaining && <p>Expires {timeRemaining}</p>}
    </div>
  );
}

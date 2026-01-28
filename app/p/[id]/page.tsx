import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function PastePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  /* ------------------ Deterministic time (TEST_MODE) ------------------ */
  let customNow: number | undefined;

  if (process.env.TEST_MODE === "1") {
    const headersList = headers();
    const headerTime = headersList.get("x-test-now-ms");

    if (headerTime) {
      const parsed = parseInt(headerTime, 10);
      if (!isNaN(parsed)) {
        customNow = parsed;
      }
    }
  }



  const res = await fetch(
  `/api/pastes/${id}`,
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


  /* ------------------ UI helpers ------------------ */
  const timeRemaining = paste.expires_at
    ? formatDistanceToNow(new Date(paste.expires_at), {
        addSuffix: true,
      })
    : null;

  /* ------------------ Render ------------------ */
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">
          Paste{" "}
          <span className="text-blue-500 text-base font-mono bg-blue-500/10 px-2 py-1 rounded ml-2">
            #{paste.id}
          </span>
        </h1>

        <div className="text-sm text-gray-500 flex gap-4">
          {paste.remaining_views !== null && (
            <span className="flex items-center gap-1 text-yellow-500/80">
              {paste.remaining_views} views left
            </span>
          )}

          {paste.expires_at && (
            <span className="flex items-center gap-1 text-purple-400/80">
              Expires {timeRemaining}
            </span>
          )}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-gray-950 px-4 py-2 border-b border-gray-800">
          <span className="text-xs text-gray-500 font-mono">
            text/plain
          </span>
        </div>

        <div className="overflow-x-auto p-4 md:p-6">
          <pre className="font-mono text-sm md:text-base text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
            {paste.content}
          </pre>
        </div>
      </div>

      <div className="text-center">
        <a
          href="/"
          className="text-gray-500 hover:text-gray-300 transition-colors text-sm underline"
        >
          Create New Paste
        </a>
      </div>
    </div>
  );
}

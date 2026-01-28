import { getPaste } from "@/lib/storage";
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
  
  let customNow: number | undefined;
  if (process.env.TEST_MODE === '1') {
      const headersList = headers();
      const headerTime = headersList.get('x-test-now-ms');
      if (headerTime) {
        const parsed = parseInt(headerTime, 10);
        if (!isNaN(parsed)) {
          customNow = parsed;
        }
      }
  }

  // const paste = await getPaste(id, customNow);

  // if (!paste) {
  //   notFound();
  // }
  const host = headers().get("host");
const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

const res = await fetch(
  `${protocol}://${host}/api/pastes/${id}`,
  { cache: "no-store" }
);

if (!res.ok) {
  notFound();
}

const paste = await res.json();


  // Calculate relative expiration string if it exists
  const timeRemaining = paste.expires_at
    ? formatDistanceToNow(new Date(paste.expires_at), { addSuffix: true })
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">
            Paste <span className="text-blue-500 text-base font-mono bg-blue-500/10 px-2 py-1 rounded ml-2">#{paste.id}</span>
        </h1>
        <div className="text-sm text-gray-500 flex gap-4">
            {paste.remaining_views !== null && (
                <span className="flex items-center gap-1 text-yellow-500/80">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    {paste.remaining_views} views left
                </span>
            )}
            {paste.expires_at && (
                <span className="flex items-center gap-1 text-purple-400/80">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Expires {timeRemaining}
                </span>
            )}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-gray-950 px-4 py-2 border-b border-gray-800 flex items-center gap-2">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <span className="text-xs text-gray-500 font-mono ml-2">text/plain</span>
        </div>
        <div className="overflow-x-auto p-4 md:p-6">
            <pre className="font-mono text-sm md:text-base text-gray-300 whitespace-pre-wrap break-words leading-relaxed selection:bg-blue-500/30 selection:text-blue-200">
                {paste.content}
            </pre>
        </div>
      </div>
      
      <div className="text-center">
        <a href="/" className="text-gray-500 hover:text-gray-300 transition-colors text-sm underline decoration-gray-700 underline-offset-4">Create New Paste</a>
      </div>
    </div>
  );
}

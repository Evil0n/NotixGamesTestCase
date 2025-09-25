import { NextRequest } from 'next/server';

type SearchItem = {
  id: string;
  title: string;
  snippet: string;
};

type SearchResponse = {
  query: string;
  items: ReadonlyArray<SearchItem>;
};

const DATA: ReadonlyArray<SearchItem> = [
  { id: '1', title: 'Alpha', snippet: 'The first item' },
  { id: '2', title: 'Beta', snippet: 'The second item' },
  { id: '3', title: 'Gamma', snippet: 'The third item' },
  { id: '4', title: 'Delta', snippet: 'Another entry' },
  { id: '5', title: 'Epsilon', snippet: 'Sample data' },
  { id: '6', title: 'Zeta', snippet: 'Zed like' },
  { id: '7', title: 'Eta', snippet: 'Greek letter' },
  { id: '8', title: 'Theta', snippet: 'Mathematical' },
  { id: '9', title: 'Iota', snippet: 'Tiny detail' },
  { id: '10', title: 'Kappa', snippet: 'Fun letter' },
];

function filterData(query: string): ReadonlyArray<SearchItem> {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];
  return DATA.filter((item) =>
    item.title.toLowerCase().includes(q) || item.snippet.toLowerCase().includes(q)
  ).slice(0, 10);
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    if (signal.aborted) {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') ?? '';
  const min = 120;
  const max = 700;
  const latency = Math.floor(Math.random() * (max - min + 1)) + min;

  try {
    await delay(latency, req.signal);
  } catch {
    return new Response(null, { status: 499 });
  }

  const items = filterData(query);
  const body: SearchResponse = { query, items };
  return Response.json(body, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}



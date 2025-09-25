import { NextRequest } from 'next/server';
import type { SearchItem, SearchResponse } from '../../types';
import { MIN_LATENCY, MAX_LATENCY, CACHE_MAX_AGE } from '../../constants';

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
  { id: '11', title: 'Lambda', snippet: 'Functional programming' },
  { id: '12', title: 'Mu', snippet: 'Micro unit' },
  { id: '13', title: 'Nu', snippet: 'Frequency symbol' },
  { id: '14', title: 'Xi', snippet: 'Unknown variable' },
  { id: '15', title: 'Omicron', snippet: 'Small circle' },
  { id: '16', title: 'Pi', snippet: 'Mathematical constant' },
  { id: '17', title: 'Rho', snippet: 'Density symbol' },
  { id: '18', title: 'Sigma', snippet: 'Summation symbol' },
  { id: '19', title: 'Tau', snippet: 'Time constant' },
  { id: '20', title: 'Upsilon', snippet: 'Upsilon particle' },
  { id: '21', title: 'Phi', snippet: 'Golden ratio' },
  { id: '22', title: 'Chi', snippet: 'Chi square' },
  { id: '23', title: 'Psi', snippet: 'Wave function' },
  { id: '24', title: 'Omega', snippet: 'Last letter' },
  { id: '25', title: 'Apple', snippet: 'Red fruit' },
  { id: '26', title: 'Banana', snippet: 'Yellow fruit' },
  { id: '27', title: 'Cherry', snippet: 'Small red fruit' },
  { id: '28', title: 'Date', snippet: 'Sweet fruit' },
  { id: '29', title: 'Elderberry', snippet: 'Dark berry' },
  { id: '30', title: 'Fig', snippet: 'Sweet fig' },
  { id: '31', title: 'Grape', snippet: 'Small round fruit' },
  { id: '32', title: 'Honeydew', snippet: 'Melon variety' },
  { id: '33', title: 'Kiwi', snippet: 'Fuzzy fruit' },
  { id: '34', title: 'Lemon', snippet: 'Citrus fruit' },
  { id: '35', title: 'Mango', snippet: 'Tropical fruit' },
  { id: '36', title: 'Orange', snippet: 'Citrus fruit' },
  { id: '37', title: 'Papaya', snippet: 'Tropical fruit' },
  { id: '38', title: 'Quince', snippet: 'Hard fruit' },
  { id: '39', title: 'Raspberry', snippet: 'Red berry' },
  { id: '40', title: 'Strawberry', snippet: 'Red berry' },
  { id: '41', title: 'Tangerine', snippet: 'Small orange' },
  { id: '42', title: 'Watermelon', snippet: 'Large melon' },
  { id: '43', title: 'Apricot', snippet: 'Stone fruit' },
  { id: '44', title: 'Blackberry', snippet: 'Dark berry' },
  { id: '45', title: 'Coconut', snippet: 'Tropical nut' },
  { id: '46', title: 'Dragonfruit', snippet: 'Exotic fruit' },
  { id: '47', title: 'Feijoa', snippet: 'Green fruit' },
  { id: '48', title: 'Guava', snippet: 'Tropical fruit' },
  { id: '49', title: 'Huckleberry', snippet: 'Wild berry' },
  { id: '50', title: 'Jackfruit', snippet: 'Large tropical fruit' },
  { id: '51', title: 'Kumquat', snippet: 'Small citrus' },
  { id: '52', title: 'Lime', snippet: 'Green citrus' },
  { id: '53', title: 'Lychee', snippet: 'Chinese fruit' },
  { id: '54', title: 'Melon', snippet: 'Sweet melon' },
  { id: '55', title: 'Nectarine', snippet: 'Smooth peach' },
  { id: '56', title: 'Olive', snippet: 'Mediterranean fruit' },
  { id: '57', title: 'Passionfruit', snippet: 'Tropical passion' },
  { id: '58', title: 'Pineapple', snippet: 'Spiky fruit' },
  { id: '59', title: 'Plum', snippet: 'Purple fruit' },
  { id: '60', title: 'Pomegranate', snippet: 'Red seeds' },
  { id: '61', title: 'Quince', snippet: 'Hard fruit' },
  { id: '62', title: 'Rambutan', snippet: 'Hairy fruit' },
  { id: '63', title: 'Star fruit', snippet: 'Star shaped' },
  { id: '64', title: 'Tamarind', snippet: 'Sour fruit' },
  { id: '65', title: 'Ugli fruit', snippet: 'Ugly citrus' },
  { id: '66', title: 'Vanilla', snippet: 'Sweet spice' },
  { id: '67', title: 'Wineberry', snippet: 'Wine colored' },
  { id: '68', title: 'Xigua', snippet: 'Chinese watermelon' },
  { id: '69', title: 'Yuzu', snippet: 'Japanese citrus' },
  { id: '70', title: 'Zucchini', snippet: 'Green squash' },
  { id: '71', title: 'Avocado', snippet: 'Green butter' },
  { id: '72', title: 'Blueberry', snippet: 'Small blue berry' },
  { id: '73', title: 'Cantaloupe', snippet: 'Orange melon' },
  { id: '74', title: 'Durian', snippet: 'Smelly fruit' },
  { id: '75', title: 'Eggplant', snippet: 'Purple vegetable' },
  { id: '76', title: 'Fennel', snippet: 'Anise flavor' },
  { id: '77', title: 'Ginger', snippet: 'Spicy root' },
  { id: '78', title: 'Horseradish', snippet: 'Hot root' },
  { id: '79', title: 'Iceberg', snippet: 'Crisp lettuce' },
  { id: '80', title: 'Jicama', snippet: 'Mexican turnip' },
  { id: '81', title: 'Kale', snippet: 'Dark green leaf' },
  { id: '82', title: 'Leek', snippet: 'Long onion' },
  { id: '83', title: 'Mushroom', snippet: 'Fungi food' },
  { id: '84', title: 'Napa', snippet: 'Chinese cabbage' },
  { id: '85', title: 'Okra', snippet: 'Slimy vegetable' },
  { id: '86', title: 'Pepper', snippet: 'Spicy vegetable' },
  { id: '87', title: 'Quinoa', snippet: 'Super grain' },
  { id: '88', title: 'Radish', snippet: 'Spicy root' },
  { id: '89', title: 'Spinach', snippet: 'Popeye food' },
  { id: '90', title: 'Tomato', snippet: 'Red fruit' },
  { id: '91', title: 'Umami', snippet: 'Fifth taste' },
  { id: '92', title: 'Vinegar', snippet: 'Sour liquid' },
  { id: '93', title: 'Wasabi', snippet: 'Hot paste' },
  { id: '94', title: 'Xylitol', snippet: 'Sugar substitute' },
  { id: '95', title: 'Yam', snippet: 'Sweet potato' },
  { id: '96', title: 'Zest', snippet: 'Citrus peel' },
  { id: '97', title: 'Arugula', snippet: 'Peppery green' },
  { id: '98', title: 'Broccoli', snippet: 'Green tree' },
  { id: '99', title: 'Cauliflower', snippet: 'White tree' },
  { id: '100', title: 'Dandelion', snippet: 'Weed greens' },
];

// Кэш для результатов поиска
const searchCache = new Map<string, ReadonlyArray<SearchItem>>();

function filterData(query: string): ReadonlyArray<SearchItem> {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];
  
  // Проверить кэш
  if (searchCache.has(q)) {
    return searchCache.get(q)!;
  }
  
  const results = DATA.filter((item) =>
    item.title.toLowerCase().includes(q) || item.snippet.toLowerCase().includes(q)
  ).slice(0, 10);
  
  // Сохранить в кэш
  searchCache.set(q, results);
  return results;
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
  const min = MIN_LATENCY;
  const max = MAX_LATENCY;
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
      'Cache-Control': `public, max-age=${CACHE_MAX_AGE}`,
    },
  });
}



import { Suspense } from 'react';
import type { ReactElement } from 'react';
import { SearchClient } from './searchClient';

export default function SearchPage(): ReactElement {
  return (
    <Suspense fallback={<div style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>Загрузка…</div>}>
      <SearchClient />
    </Suspense>
  );
}



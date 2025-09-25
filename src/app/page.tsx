import { Suspense } from 'react';
import type { ReactElement } from 'react';
import { SearchClient } from './searchClient';

const Home = (): ReactElement => {
  return (
    <Suspense fallback={<div style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>Загрузка…</div>}>
      <SearchClient />
    </Suspense>
  );
};

export default Home;

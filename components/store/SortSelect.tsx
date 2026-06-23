'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface Props {
  current?: string;
}

export default function SortSelect({ current = 'newest' }: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select defaultValue={current} onChange={handleChange} style={{ fontFamily: 'inherit', fontSize: '0.875rem' }}>
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
    </select>
  );
}

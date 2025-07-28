import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

async function getSerials() {
  const { data, error } = await supabase
    .from('serials')
    .select('*, messages(count)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching serials:', error);
    return [];
  }
  return data;
}

export default async function SerialsPage() {
  const serials = await getSerials();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">登録一覧</h1>
        <p className="mt-3 text-lg text-gray-400">これまでに記録された全ての思い出です。</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {serials.map((serial) => (
          <Link href={`/?serial=${serial.serial_number}`} key={serial.id}>
            <div className="block h-full rounded-lg border border-gray-800 bg-gray-900/50 p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-gold-400">
              <h2 className="text-xl font-bold text-gold-400">{serial.serial_number}</h2>
              <p className="mt-2 text-sm text-gray-400">
                {serial.messages[0]?.count ?? 0} 件の思い出
              </p>
              <p className="mt-1 text-xs text-gray-500">
                最初の記録: {new Date(serial.created_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
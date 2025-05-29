import { EthData } from '@/lib/types';
import { createClient } from '@/utils/supbase/server';

export async function fetchEthDataByDate(date: string, symbols: string[]): Promise<EthData[]> {
  const supabase = await createClient();

  const allData: EthData[] = [];


  for (const symbol of symbols) {
    const { data, error } = await supabase.rpc('get_eth_history', {
      symbol,
      reference_date: date,
    });

    if (error) {
      console.error(`Failed to fetch ETH data for ${symbol}:`, error.message);
      continue;
    }

    console.log(`✅ Fetched data for ${symbol}:`, data.length, 'rows');
    allData.push(...(data ?? []));
  }

  return allData;
}

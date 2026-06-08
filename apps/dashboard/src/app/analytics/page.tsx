import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VolumeChart } from "@/components/charts/VolumeChart";
import { CountryChart } from "@/components/charts/CountryChart";
import { AssetPieChart } from "@/components/charts/AssetPieChart";
import { api } from "@/lib/api";
import { formatAmount } from "@/lib/utils";

export const revalidate = 60;

async function getData() {
  try {
    const [dailyVolume, monthlyVolume, countryStats, assetDist, funding] = await Promise.all([
      api.stats.dailyVolume(30),
      api.stats.monthlyVolume(12),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments?pageSize=1`).then(r => r.json()).then(() => []).catch(() => []),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments?pageSize=1`).then(r => r.json()).then(() => []).catch(() => []),
      api.stats.funding(),
    ]);
    return { dailyVolume, monthlyVolume, countryStats: [], assetDist: [], funding };
  } catch {
    return { dailyVolume: [], monthlyVolume: [], countryStats: [], assetDist: [], funding: null };
  }
}

export default async function AnalyticsPage() {
  const { dailyVolume, monthlyVolume, funding } = await getData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Ecosystem metrics and trends</p>
      </div>

      {funding && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total Allocated</p>
            <p className="text-xl font-bold mt-1">{formatAmount(funding.totalAllocated)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Total Released</p>
            <p className="text-xl font-bold mt-1">{formatAmount(funding.totalReleased)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Active Streams</p>
            <p className="text-xl font-bold mt-1">{funding.activeStreams}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Completed Streams</p>
            <p className="text-xl font-bold mt-1">{funding.completedStreams}</p>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Daily Volume (30d)</CardTitle></CardHeader>
          <CardContent><VolumeChart data={dailyVolume} title="" /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Monthly Volume (12mo)</CardTitle></CardHeader>
          <CardContent><VolumeChart data={monthlyVolume} title="" /></CardContent>
        </Card>
      </div>
    </div>
  );
}

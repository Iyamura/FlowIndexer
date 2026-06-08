import {
  Users,
  Building2,
  CreditCard,
  Network,
  Banknote,
  Globe,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VolumeChart } from "@/components/charts/VolumeChart";
import { TrustMetricsChart } from "@/components/charts/TrustMetricsChart";
import { CountryChart } from "@/components/charts/CountryChart";
import { AssetPieChart } from "@/components/charts/AssetPieChart";
import { api } from "@/lib/api";
import { formatNumber, formatAmount } from "@/lib/utils";

export const revalidate = 30;

async function getData() {
  try {
    const [ecosystem, dailyVolume, trustMetrics, countryStats, assetDist] = await Promise.all([
      api.stats.ecosystem(),
      api.stats.dailyVolume(30),
      api.trust.list({ pageSize: "1" }).then(() => [] as any[]).catch(() => []),
      api.payments.list({ pageSize: "1" }).then(() => [] as any[]).catch(() => []),
      api.stats.dailyVolume(30),
    ]);
    return { ecosystem, dailyVolume, trustMetrics: [], countryStats: [], assetDist: [] };
  } catch {
    return {
      ecosystem: {
        totalUsers: 0, totalOrganizations: 0, totalTransactions: 0, totalVolume: "0",
        totalTrustRelationships: 0, activeFundingStreams: 0, totalRecipients: 0, countriesReached: 0,
      },
      dailyVolume: [],
      trustMetrics: [],
      countryStats: [],
      assetDist: [],
    };
  }
}

export default async function OverviewPage() {
  const { ecosystem, dailyVolume } = await getData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">OpenTrust ecosystem activity</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Users" value={formatNumber(ecosystem.totalUsers)} icon={Users} />
        <StatCard title="Organizations" value={formatNumber(ecosystem.totalOrganizations)} icon={Building2} />
        <StatCard title="Transactions" value={formatNumber(ecosystem.totalTransactions)} icon={CreditCard} />
        <StatCard title="Total Volume" value={formatAmount(ecosystem.totalVolume)} icon={Banknote} />
        <StatCard title="Trust Links" value={formatNumber(ecosystem.totalTrustRelationships)} icon={Network} />
        <StatCard title="Countries" value={String(ecosystem.countriesReached)} icon={Globe} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Volume (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <VolumeChart data={dailyVolume} title="" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Funding Streams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[250px]">
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">{ecosystem.activeFundingStreams}</p>
                <p className="text-sm text-muted-foreground mt-2">active streams</p>
                <p className="text-sm text-muted-foreground">{formatNumber(ecosystem.totalRecipients)} total recipients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

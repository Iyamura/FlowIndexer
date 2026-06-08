import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { truncateAddress, formatAmount, timeAgo } from "@/lib/utils";

export const revalidate = 30;

const statusVariant: Record<string, any> = {
  ACTIVE: "success", PAUSED: "warning", COMPLETED: "default", CANCELLED: "destructive",
};

export default async function FundingPage() {
  let result: any = { data: [], total: 0 };
  try { result = await api.funding.list({ pageSize: "20" }); } catch {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Funding Streams</h1>
        <p className="text-muted-foreground text-sm mt-1">{result.total} streams indexed</p>
      </div>

      <div className="grid gap-4">
        {result.data?.map((stream: any) => (
          <Card key={stream.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[stream.status] ?? "outline"}>{stream.status}</Badge>
                    <Badge variant="outline">{stream.streamType}</Badge>
                    <span className="text-sm font-medium">{stream.asset}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {truncateAddress(stream.creator?.stellarAddress ?? stream.creatorId)} →{" "}
                    {truncateAddress(stream.recipient?.stellarAddress ?? stream.recipientId)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatAmount(stream.totalAmount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatAmount(stream.releasedAmount)} released
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${Math.min(100, (Number(stream.releasedAmount) / Math.max(1, Number(stream.totalAmount))) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Created {timeAgo(stream.createdAt)}</p>
            </CardContent>
          </Card>
        ))}
        {result.data?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              No funding streams indexed yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

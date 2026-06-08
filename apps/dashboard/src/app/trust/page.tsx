import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustGraphViewer } from "@/components/explorer/TrustGraphViewer";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { truncateAddress, timeAgo } from "@/lib/utils";

export const revalidate = 60;

export default async function TrustPage() {
  let relationships: any = { data: [], total: 0 };
  let graph: any = { nodes: [], edges: [] };

  try {
    [relationships, graph] = await Promise.all([
      api.trust.list({ pageSize: "20" }),
      api.trust.graph(),
    ]);
  } catch {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trust Graph</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {relationships.total} trust relationships indexed
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Network Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <TrustGraphViewer nodes={graph.nodes} edges={graph.edges} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Trust Relationships</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {relationships.data?.map((rel: any) => (
              <div key={rel.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">
                    {truncateAddress(rel.trustor?.stellarAddress ?? rel.trustorId)}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {truncateAddress(rel.trustee?.stellarAddress ?? rel.trusteeId)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={rel.status === "ACTIVE" ? "success" : "outline"}>{rel.trustType}</Badge>
                  <span className="text-xs text-muted-foreground">{timeAgo(rel.createdAt)}</span>
                </div>
              </div>
            ))}
            {relationships.data?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No trust relationships indexed yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

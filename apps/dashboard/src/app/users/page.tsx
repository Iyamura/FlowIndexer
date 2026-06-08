import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { truncateAddress, timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const revalidate = 30;

export default async function UsersPage() {
  let result: any = { data: [], total: 0 };
  try { result = await api.users.list({ pageSize: "50" }); } catch {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">{result.total} users indexed</p>
      </div>

      <Card>
        <CardHeader><CardTitle>All Users</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {result.data?.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-mono text-xs">{truncateAddress(user.stellarAddress, 10)}</p>
                  {user.displayName && <p className="text-sm text-muted-foreground">{user.displayName}</p>}
                  {user.organization && <p className="text-xs text-muted-foreground">{user.organization.name}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {user.trustScores?.[0] && (
                    <Badge variant="default">Trust: {user.trustScores[0].score.toFixed(0)}</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{timeAgo(user.createdAt)}</span>
                </div>
              </div>
            ))}
            {result.data?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No users indexed yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

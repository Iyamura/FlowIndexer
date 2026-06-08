import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { truncateAddress, timeAgo } from "@/lib/utils";

export const revalidate = 0;

async function search(q: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const isAddress = /^G[A-Z2-7]{55}$/.test(q);
  const isTxHash = /^[a-f0-9]{64}$/i.test(q);

  try {
    if (isAddress) {
      const [user, payments] = await Promise.all([
        fetch(`${apiUrl}/api/users/${q}`).then(r => r.ok ? r.json() : null),
        fetch(`${apiUrl}/api/payments?address=${q}&pageSize=10`).then(r => r.json()),
      ]);
      return { type: "address", user: user?.data, payments: payments?.data ?? [] };
    }
    if (isTxHash) {
      const tx = await fetch(`${apiUrl}/api/transactions/${q}`).then(r => r.ok ? r.json() : null);
      return { type: "transaction", tx: tx?.data };
    }
    const [orgs, users] = await Promise.all([
      fetch(`${apiUrl}/api/organizations?search=${encodeURIComponent(q)}&pageSize=5`).then(r => r.json()),
      fetch(`${apiUrl}/api/users?search=${encodeURIComponent(q)}&pageSize=5`).then(r => r.json()),
    ]);
    return { type: "search", orgs: orgs?.data ?? [], users: users?.data ?? [] };
  } catch {
    return { type: "error" };
  }
}

export default async function ExplorerPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q ?? "";
  const results = q ? await search(q) : null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Ecosystem Explorer</h1>
        <p className="text-muted-foreground text-sm mt-1">Search wallets, transactions, and organizations</p>
      </div>

      {!q && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Use the search bar above to explore wallets, transactions, and organizations.
          </CardContent>
        </Card>
      )}

      {results?.type === "address" && (
        <div className="space-y-4">
          {results.user && (
            <Card>
              <CardHeader><CardTitle>User Profile</CardTitle></CardHeader>
              <CardContent>
                <p className="font-mono text-sm">{results.user.stellarAddress}</p>
                {results.user.displayName && <p className="text-muted-foreground text-sm">{results.user.displayName}</p>}
                <div className="flex gap-2 mt-2">
                  <Badge variant={results.user.isActive ? "success" : "outline"}>
                    {results.user.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {results.user.organization && <Badge variant="default">{results.user.organization.name}</Badge>}
                </div>
              </CardContent>
            </Card>
          )}
          {results.payments?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Recent Payments</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.payments.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                      <span className="font-mono text-xs text-muted-foreground">
                        {truncateAddress(p.fromAddress)} → {truncateAddress(p.toAddress)}
                      </span>
                      <span className="font-medium">{p.amount} {p.assetCode}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {results?.type === "transaction" && results.tx && (
        <Card>
          <CardHeader><CardTitle>Transaction</CardTitle></CardHeader>
          <CardContent>
            <p className="font-mono text-xs break-all">{results.tx.txHash}</p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
              <div><span className="text-muted-foreground">Ledger:</span> {results.tx.ledger}</div>
              <div><span className="text-muted-foreground">Status:</span> {results.tx.successful ? "Success" : "Failed"}</div>
              <div><span className="text-muted-foreground">Operations:</span> {results.tx.operationCount}</div>
              <div><span className="text-muted-foreground">Time:</span> {timeAgo(results.tx.createdAt)}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {results?.type === "search" && (
        <div className="space-y-4">
          {results.orgs?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Organizations</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.orgs.map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{o.name}</p>
                        <p className="text-xs text-muted-foreground">{o.slug}</p>
                      </div>
                      {o.isVerified && <Badge variant="success">Verified</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {results.users?.length === 0 && results.orgs?.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                No results found for "{q}"
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

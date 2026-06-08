import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { truncateAddress, timeAgo, formatAmount } from "@/lib/utils";

export const revalidate = 10;

export default async function PaymentsPage() {
  let result: any = { data: [], total: 0 };
  try { result = await api.payments.list({ pageSize: "50" }); } catch {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground text-sm mt-1">{result.total} total payments indexed</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Payments</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-4">From</th>
                  <th className="text-left py-2 pr-4">To</th>
                  <th className="text-right py-2 pr-4">Amount</th>
                  <th className="text-left py-2 pr-4">Asset</th>
                  <th className="text-left py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {result.data?.map((p: any) => (
                  <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-2 pr-4 font-mono text-xs">{truncateAddress(p.fromAddress)}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{truncateAddress(p.toAddress)}</td>
                    <td className="py-2 pr-4 text-right font-medium">{formatAmount(p.amount)}</td>
                    <td className="py-2 pr-4">
                      <Badge variant="outline">{p.assetCode}</Badge>
                    </td>
                    <td className="py-2 text-muted-foreground text-xs">{timeAgo(p.createdAt)}</td>
                  </tr>
                ))}
                {result.data?.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No payments indexed yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

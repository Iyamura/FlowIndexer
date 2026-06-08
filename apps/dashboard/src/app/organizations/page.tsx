import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { Building2, Globe } from "lucide-react";

export const revalidate = 60;

export default async function OrganizationsPage() {
  let result: any = { data: [], total: 0 };
  try { result = await api.organizations.list({ pageSize: "50" }); } catch {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organizations</h1>
        <p className="text-muted-foreground text-sm mt-1">{result.total} organizations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {result.data?.map((org: any) => (
          <Card key={org.id}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{org.name}</p>
                    {org.isVerified && <Badge variant="success">✓</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{org.slug}</p>
                  {org.country && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      {org.country}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">{timeAgo(org.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {result.data?.length === 0 && (
          <div className="col-span-3">
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground text-sm">
                No organizations indexed yet.
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

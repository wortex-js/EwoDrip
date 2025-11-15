import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, LogOut, Package, Calendar, Mail } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { data: recentOrders } = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success(t('profile.logoutSuccess'));
      window.location.href = "/";
    },
    onError: () => {
      toast.error(t('profile.logoutError'));
    },
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">{t('auth.login')} {t('common.required')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('profile.signInRequired')}
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>{t('auth.login')}</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="container py-8 max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight mb-8">{t('profile.title')}</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.accountInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('profile.name')}</p>
                  <p className="font-medium">{user?.name || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('profile.email')}</p>
                  <p className="font-medium">{user?.email || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('profile.memberSince')}</p>
                  <p className="font-medium">{user?.createdAt ? formatDate(user.createdAt) : "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('profile.recentOrders')}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/orders")}
              >
                {t('profile.viewAllOrders')}
              </Button>
            </CardHeader>
            <CardContent>
              {!recentOrders || recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('orders.noOrders')}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setLocation("/products")}
                  >
                    {t('hero.shopNow')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">
                          {t('orders.orderNumber')} #{order.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(order.totalAmount)}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {t(`orders.status.${order.status}`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {user?.role === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle>{t('nav.admin')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('profile.adminAccess')}
                </p>
                <Button onClick={() => setLocation("/admin")}>
                  {t('profile.adminPanel')}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {logoutMutation.isPending ? t('checkout.processing') : t('profile.logout')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="border-t border-border bg-card mt-16">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 {APP_TITLE}. {t('footer.rights')}</p>
          <p className="mt-2">{t('footer.madeBy')} wortex213433</p>
        </div>
      </footer>
    </div>
  );
}

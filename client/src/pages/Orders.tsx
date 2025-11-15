import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { data: orders, isLoading } = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: orderItems } = trpc.orders.items.useQuery(
    { orderId: selectedOrder?.id || 0 },
    { enabled: !!selectedOrder }
  );

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "processing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "shipped":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "delivered":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">{t('auth.login')} {t('common.required')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('orders.signInRequired')}
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
        <h1 className="text-4xl font-bold tracking-tight mb-8">{t('orders.title')}</h1>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        ) : !orders || orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">{t('orders.noOrders')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('orders.noOrdersDescription')}
            </p>
            <Button asChild>
              <a href="/products">{t('hero.shopNow')}</a>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {t('orders.orderNumber')} #{order.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="text-lg font-bold">{formatPrice(order.totalAmount)}</p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {t(`orders.status.${order.status}`)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setDialogOpen(true);
                        }}
                      >
                        {t('orders.viewDetails')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('orders.orderNumber')} #{selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{t('orders.date')}</p>
                  <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('orders.status')}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {t(`orders.status.${selectedOrder.status}`)}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('checkout.fullName')}</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('checkout.email')}</p>
                  <p className="font-medium">{selectedOrder.customerEmail}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('checkout.address')}</p>
                <p className="font-medium">
                  {selectedOrder.shippingAddress}
                  <br />
                  {selectedOrder.shippingCity}, {selectedOrder.shippingPostalCode}
                  <br />
                  {selectedOrder.shippingCountry}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">{t('orders.items')}</h3>
                <div className="space-y-3">
                  {orderItems?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 pb-3 border-b border-border last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('cart.quantity')}: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">{formatPrice(item.productPrice * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                  <span className="font-medium">
                    {formatPrice(selectedOrder.totalAmount - (selectedOrder.shippingCost || 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('checkout.shipping')}</span>
                  <span className="font-medium">{formatPrice(selectedOrder.shippingCost || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('cart.total')}</span>
                  <span>{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <footer className="border-t border-border bg-card mt-16">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 {APP_TITLE}. {t('footer.rights')}</p>
          <p className="mt-2">{t('footer.madeBy')} wortex213433</p>
        </div>
      </footer>
    </div>
  );
}

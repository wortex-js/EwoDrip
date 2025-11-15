import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, ArrowLeft, Plus, Minus, Trash2 } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const utils = trpc.useUtils();
  const { data: cartItems, isLoading } = trpc.cart.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateQuantityMutation = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || t('cart.insufficientStock'));
    },
  });

  const removeItemMutation = trpc.cart.remove.useMutation({
    onSuccess: () => {
      toast.success(t('cart.itemRemoved'));
      utils.cart.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove item");
    },
  });

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = cartItems?.reduce((sum, item) => {
    return sum + (item.productPrice || 0) * item.quantity;
  }, 0) || 0;

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ id, quantity: newQuantity });
  };

  const handleRemoveItem = (id: number) => {
    removeItemMutation.mutate({ id });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">{t('auth.login')} {t('common.required')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('cart.signInRequired')}
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

      <div className="container py-8">
        <Link href="/products">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('cart.continueShopping')}
          </Button>
        </Link>

        <h1 className="text-4xl font-bold tracking-tight mb-8">{t('cart.title')}</h1>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        ) : !cartItems || cartItems.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">{t('cart.empty')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('cart.emptyDescription')}
            </p>
            <Button asChild>
              <Link href="/products">{t('nav.products')}</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const images = item.productImages ? JSON.parse(item.productImages) : [];
                const mainImage = images[0] || "/placeholder.jpg";

                return (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-muted">
                          <img
                            src={mainImage}
                            alt={item.productName || "Product"}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1">{item.productName}</h3>
                          <p className="text-lg font-bold mb-2">
                            {formatPrice(item.productPrice || 0)}
                          </p>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={
                                item.quantity >= (item.productStock || 0) ||
                                updateQuantityMutation.isPending
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between">
                          <p className="font-bold">
                            {formatPrice((item.productPrice || 0) * item.quantity)}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removeItemMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">{t('checkout.orderSummary')}</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('checkout.shipping')}</span>
                      <span className="font-medium">{t('cart.calculatedAtCheckout')}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="font-bold">{t('cart.total')}</span>
                      <span className="font-bold text-xl">{formatPrice(subtotal)}</span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full text-base"
                    onClick={() => setLocation("/checkout")}
                  >
                    {t('cart.proceedToCheckout')}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    {t('cart.taxesCalculated')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
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

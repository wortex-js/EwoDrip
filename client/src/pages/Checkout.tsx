import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, ArrowLeft, User } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { data: cartItems, isLoading: cartLoading } = trpc.cart.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });


  const [formData, setFormData] = useState({
    customerName: user?.name || "",
    customerEmail: user?.email || "",
    customerPhone: "",
    shippingAddress: "",
    shippingCity: "",
    shippingPostalCode: "",
    shippingCountry: "",
    notes: "",
  });

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: async (data) => {
      toast.success("Order created! Redirecting to payment...");
      
      try {
        const checkoutSession = await createCheckoutMutation.mutateAsync({
          orderId: data.orderId,
          totalAmount: total,
        });
        
        if (checkoutSession.url) {
          window.open(checkoutSession.url, '_blank');
          toast.info("Please complete payment in the new tab");
          setLocation('/orders');
        }
      } catch (error: any) {
        console.error('Stripe checkout error:', error);
        toast.error(error.message || "Failed to create payment session");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to place order");
    },
  });

  const createCheckoutMutation = trpc.stripe.createCheckoutSession.useMutation();

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const { data: allSettings } = trpc.settings.getAll.useQuery();

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = cartItems?.reduce((sum, item) => {
    return sum + (item.productPrice || 0) * item.quantity;
  }, 0) || 0;

  const shippingFeeSetting = allSettings?.find(s => s.key === "shipping_fee");
  const freeShippingThresholdSetting = allSettings?.find(s => s.key === "free_shipping_threshold");
  
  const baseShippingFee = shippingFeeSetting ? parseInt(shippingFeeSetting.value) : 0;
  const freeShippingThreshold = freeShippingThresholdSetting ? parseInt(freeShippingThresholdSetting.value) : 0;
  
  const shipping = (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) ? 0 : baseShippingFee;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerEmail || !formData.shippingAddress || 
        !formData.shippingCity || !formData.shippingPostalCode || !formData.shippingCountry) {
      toast.error("Please fill in all required fields");
      return;
    }

    createOrderMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">{t('auth.login')} {t('common.required')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('checkout.signInRequired')}
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>{t('auth.login')}</a>
          </Button>
        </Card>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">{t('cart.empty')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('checkout.emptyCartDescription')}
          </p>
          <Button asChild>
            <Link href="/products">{t('nav.products')}
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="container py-8">
        <Link href="/cart">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('checkout.backToCart')}
          </Button>
        </Link>

        <h1 className="text-4xl font-bold tracking-tight mb-8">{t('checkout.title')}</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('checkout.contactInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">{t('checkout.fullName')} *</Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">{t('checkout.email')} *</Label>
                    <Input
                      id="customerEmail"
                      name="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">{t('checkout.phone')}</Label>
                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('checkout.shippingAddress')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="shippingAddress">{t('checkout.address')} *</Label>
                    <Input
                      id="shippingAddress"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shippingCity">{t('checkout.city')} *</Label>
                      <Input
                        id="shippingCity"
                        name="shippingCity"
                        value={formData.shippingCity}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="shippingPostalCode">{t('checkout.postalCode')} *</Label>
                      <Input
                        id="shippingPostalCode"
                        name="shippingPostalCode"
                        value={formData.shippingPostalCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="shippingCountry">{t('checkout.country')} *</Label>
                    <Input
                      id="shippingCountry"
                      name="shippingCountry"
                      value={formData.shippingCountry}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="notes">Additional Information (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions for your order..."
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          {formatPrice((item.productPrice || 0) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? "Free" : formatPrice(shipping)}
                        {freeShippingThreshold > 0 && subtotal < freeShippingThreshold && (
                          <span className="text-xs text-muted-foreground block mt-1">
                            Free shipping on orders over {formatPrice(freeShippingThreshold)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-xl">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-base"
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? "Processing..." : "Place Order"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By placing your order, you agree to our terms and conditions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 {APP_TITLE}. All rights reserved.</p>
          <p className="mt-2">Made by wortex213433</p>
        </div>
      </footer>
    </div>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const utils = trpc.useUtils();
  const { data: product, isLoading } = trpc.products.bySlug.useQuery({ slug: slug || "" });
  const [quantity, setQuantity] = useState(1);

  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success(t('product.addedToCart'));
      utils.cart.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || t('cart.insufficientStock'));
    },
  });

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (!product) return;
    
    addToCartMutation.mutate({
      productId: product.id,
      quantity,
    });
  };

  const images = product?.images ? JSON.parse(product.images) : [];
  const mainImage = images[0] || "/placeholder.jpg";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('product.notFound')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('product.notFoundDescription')}
          </p>
          <Button asChild>
            <Link href="/products">{t('nav.products')}</Link>
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
            {t('common.back')}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.slice(1, 5).map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer hover:opacity-75 transition-opacity"
                  >
                    <img src={img} alt={`${product.name} ${idx + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">{product.name}</h1>
              <p className="text-3xl font-bold">{formatPrice(product.price)}</p>
            </div>

            {product.stock === 0 ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-destructive font-semibold">{t('product.outOfStock')}</p>
              </div>
            ) : product.stock < 10 ? (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-yellow-600 dark:text-yellow-400 font-semibold">
                  {t('product.lowStock')}: {product.stock} {t('product.remaining')}
                </p>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-600 dark:text-green-400 font-semibold">{t('product.inStock')}</p>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold mb-2">{t('product.description')}</h2>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {product.stock > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('cart.quantity')}</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full text-base"
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                >
                  {addToCartMutation.isPending ? t('checkout.processing') : t('product.addToCart')}
                </Button>
              </div>
            )}

            <div className="border-t border-border pt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('product.category')}</span>
                <span className="font-medium">{product.categoryId || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('product.stock')}</span>
                <span className="font-medium">{product.stock}</span>
              </div>
            </div>
          </div>
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

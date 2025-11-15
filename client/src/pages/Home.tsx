import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, User, Menu } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { data: featuredProducts, isLoading } = trpc.products.featured.useQuery();
  const { data: cartItems } = trpc.cart.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            {APP_TITLE}
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
              {t('nav.products')}
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
              {t('nav.categories')}
            </Link>
            {isAuthenticated && (
              <Link href="/orders" className="text-sm font-medium hover:text-primary transition-colors">
                {t('nav.orders')}
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>{t('auth.login')}</a>
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <nav className="container py-4 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-sm font-medium">{t('common.language')}</span>
                <LanguageSwitcher />
              </div>
              <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
                {t('nav.products')}
              </Link>
              <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
                {t('nav.categories')}
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/orders" className="text-sm font-medium hover:text-primary transition-colors">
                    {t('nav.orders')}
                  </Link>
                  <Link href="/cart" className="text-sm font-medium hover:text-primary transition-colors">
                    {t('nav.cart')} ({cartCount})
                  </Link>
                  <Link href="/profile" className="text-sm font-medium hover:text-primary transition-colors">
                    {t('nav.profile')}
                  </Link>
                </>
              )}
              {!isAuthenticated && (
                <Button asChild className="w-full">
                  <a href={getLoginUrl()}>{t('auth.login')}</a>
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

      <section className="relative overflow-hidden border-b border-border">
        <div className="container py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
              {t('hero.title')}
              <br />
              <span className="text-muted-foreground">{t('hero.subtitle')}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              {t('hero.description')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="text-base">
                <Link href="/products">{t('hero.shopNow')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link href="/categories">{t('hero.browseCategories')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {t('featured.title')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('featured.subtitle')}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-[3/4] bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.slice(0, 8).map((product) => {
                const images = product.images ? JSON.parse(product.images) : [];
                const mainImage = images[0] || "/placeholder.jpg";

                return (
                  <Link key={product.id} href={`/product/${product.slug}`}>
                    <Card className="overflow-hidden group cursor-pointer hover:border-primary transition-all">
                      <div className="aspect-[3/4] overflow-hidden bg-muted">
                        <img
                          src={mainImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold">{formatPrice(product.price)}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/products">{t('featured.viewAll')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">{APP_TITLE}</h3>
              <p className="text-sm text-muted-foreground">
                {t('footer.tagline')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.shop')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/products" className="hover:text-foreground transition-colors">{t('footer.allProducts')}</Link>
                </li>
                <li>
                  <Link href="/categories" className="hover:text-foreground transition-colors">{t('footer.categories')}</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.account')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link href="/profile" className="hover:text-foreground transition-colors">{t('footer.profile')}</Link>
                    </li>
                    <li>
                      <Link href="/orders" className="hover:text-foreground transition-colors">{t('footer.orders')}</Link>
                    </li>
                  </>
                ) : (
                  <li>
                    <a href={getLoginUrl()} className="hover:text-foreground transition-colors">
                      {t('auth.login')}
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.info')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{t('footer.shipping')}</li>
                <li>{t('footer.privacy')}</li>
                <li>{t('footer.terms')}</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2024 {APP_TITLE}. {t('footer.rights')}</p>
            <p className="mt-2">{t('footer.madeBy')} wortex213433</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

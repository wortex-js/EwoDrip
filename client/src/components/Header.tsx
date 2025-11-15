import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Menu } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { data: cartItems } = trpc.cart.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
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
  );
}

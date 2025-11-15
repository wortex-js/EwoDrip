import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Products() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const filteredProducts = selectedCategory
    ? products?.filter((p) => p.categoryId === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="container py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        </Link>

        <h1 className="text-4xl font-bold tracking-tight mb-8">{t('nav.products')}</h1>

        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            {t('categories.allCategories')}
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
            {filteredProducts?.map((product) => {
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
                      {product.stock === 0 && (
                        <p className="text-sm text-destructive mt-1">{t('product.outOfStock')}</p>
                      )}
                      {product.stock > 0 && product.stock < 10 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('product.stock')}: {product.stock}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
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

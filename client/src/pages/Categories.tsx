import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Categories() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { data: categories } = trpc.categories.list.useQuery();
  
  const [filters, setFilters] = useState({
    query: "",
    categoryId: undefined as number | undefined,
    minPrice: "",
    maxPrice: "",
    inStock: false,
    sortBy: "date-desc" as "price-asc" | "price-desc" | "name-asc" | "name-desc" | "date-desc",
  });

  const { data: products, isLoading } = trpc.products.search.useQuery({
    query: filters.query || undefined,
    categoryId: filters.categoryId,
    minPrice: filters.minPrice ? Math.round(parseFloat(filters.minPrice) * 100) : undefined,
    maxPrice: filters.maxPrice ? Math.round(parseFloat(filters.maxPrice) * 100) : undefined,
    inStock: filters.inStock || undefined,
    sortBy: filters.sortBy,
  });

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      categoryId: undefined,
      minPrice: "",
      maxPrice: "",
      inStock: false,
      sortBy: "date-desc",
    });
  };

  const hasActiveFilters = filters.query || filters.categoryId || filters.minPrice || filters.maxPrice || filters.inStock;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="container py-8">
        <h1 className="text-4xl font-bold tracking-tight mb-8">{t('categories.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">{t('categories.filters')}</h2>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 px-2"
                    >
                      <X className="h-4 w-4 mr-1" />
                      {t('categories.clearFilters')}
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <Label>{t('search.placeholder')}</Label>
                    <Input
                      placeholder={t('search.placeholder')}
                      value={filters.query}
                      onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>{t('product.category')}</Label>
                    <Select
                      value={filters.categoryId?.toString() || "all"}
                      onValueChange={(value) =>
                        setFilters({
                          ...filters,
                          categoryId: value === "all" ? undefined : parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('categories.allCategories')}</SelectItem>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t('categories.priceRange')}</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Input
                        type="number"
                        placeholder={t('categories.minPrice')}
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      />
                      <Input
                        type="number"
                        placeholder={t('categories.maxPrice')}
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{t('categories.stockStatus')}</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="inStock"
                        checked={filters.inStock}
                        onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <label htmlFor="inStock" className="text-sm">
                        {t('categories.inStock')}
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label>{t('categories.sortBy')}</Label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value: any) => setFilters({ ...filters, sortBy: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">{t('categories.sortNewest')}</SelectItem>
                        <SelectItem value="price-asc">{t('categories.sortPriceLow')}</SelectItem>
                        <SelectItem value="price-desc">{t('categories.sortPriceHigh')}</SelectItem>
                        <SelectItem value="name-asc">{t('categories.sortNameAZ')}</SelectItem>
                        <SelectItem value="name-desc">{t('categories.sortNameZA')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-[3/4] bg-muted animate-pulse" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !products || products.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">{t('categories.noProducts')}</p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} className="mt-4">
                    {t('categories.clearFilters')}
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
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

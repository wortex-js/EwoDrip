import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminSettings() {
  const utils = trpc.useUtils();
  const { data: allSettings } = trpc.settings.getAll.useQuery();
  
  const [shippingFee, setShippingFee] = useState("");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripePublishableKey, setStripePublishableKey] = useState("");

  useEffect(() => {
    if (allSettings) {
      const shippingFeeSetting = allSettings.find(s => s.key === "shipping_fee");
      const thresholdSetting = allSettings.find(s => s.key === "free_shipping_threshold");
      
      if (shippingFeeSetting) {
        setShippingFee((parseInt(shippingFeeSetting.value) / 100).toString());
      }
      if (thresholdSetting) {
        setFreeShippingThreshold((parseInt(thresholdSetting.value) / 100).toString());
      }
      
      const stripeSetting = allSettings.find(s => s.key === "stripe_secret_key");
      const stripePublicSetting = allSettings.find(s => s.key === "stripe_publishable_key");
      if (stripeSetting) setStripeSecretKey(stripeSetting.value);
      if (stripePublicSetting) setStripePublishableKey(stripePublicSetting.value);
    }
  }, [allSettings]);

  const upsertMutation = trpc.settings.upsert.useMutation({
    onSuccess: () => {
      toast.success("Settings updated successfully");
      utils.settings.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update settings");
    },
  });

  const handleSave = () => {
    const shippingFeeInCents = Math.round(parseFloat(shippingFee || "0") * 100);
    const thresholdInCents = Math.round(parseFloat(freeShippingThreshold || "0") * 100);

    upsertMutation.mutate({
      key: "shipping_fee",
      value: shippingFeeInCents.toString(),
    });

    upsertMutation.mutate({
      key: "free_shipping_threshold",
      value: thresholdInCents.toString(),
    });

    if (stripeSecretKey) {
      upsertMutation.mutate({
        key: "stripe_secret_key",
        value: stripeSecretKey,
      });
    }

    if (stripePublishableKey) {
      upsertMutation.mutate({
        key: "stripe_publishable_key",
        value: stripePublishableKey,
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage global site configuration
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="shippingFee">Shipping Fee (USD)</Label>
              <Input
                id="shippingFee"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Base shipping cost for all orders. Set to 0 for free shipping.
              </p>
            </div>

            <div>
              <Label htmlFor="freeShippingThreshold">
                Free Shipping Threshold (USD)
              </Label>
              <Input
                id="freeShippingThreshold"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Orders above this amount get free shipping. Set to 0 to disable.
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={upsertMutation.isPending}
            >
              {upsertMutation.isPending ? "Saving..." : "Save Shipping Settings"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stripe Payment Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
              <Input
                id="stripeSecretKey"
                type="password"
                placeholder="sk_test_..."
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Your Stripe secret key (starts with sk_test_ for test mode)
              </p>
            </div>

            <div>
              <Label htmlFor="stripePublishableKey">Stripe Publishable Key</Label>
              <Input
                id="stripePublishableKey"
                type="text"
                placeholder="pk_test_..."
                value={stripePublishableKey}
                onChange={(e) => setStripePublishableKey(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Your Stripe publishable key (starts with pk_test_ for test mode)
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={upsertMutation.isPending}
            >
              {upsertMutation.isPending ? "Saving..." : "Save Stripe Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

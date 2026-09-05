import { PricingTable } from "@clerk/nextjs"

export const metadata = {
  title: "Billing",
}

export default function BillingPage() {
  return (
    <div className="flex w-full flex-col gap-8 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Pick a plan that fits how your organization works. You can change or
          cancel anytime.
        </p>
      </div>

      <PricingTable
        for="organization"
        ctaPosition="bottom"
        newSubscriptionRedirectUrl="/billing"
        appearance={{
          elements: {
            pricingTable: "w-full",
            pricingTableCard:
              "flex-1 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md",
            pricingTableCardHeader: "gap-2",
            pricingTableCardTitleContainer: "gap-1.5",
            pricingTableCardTitle: "text-lg font-semibold tracking-tight",
            pricingTableCardBadge:
              "rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground",
            pricingTableCardDescription: "text-sm text-muted-foreground",
            pricingTableCardFeeContainer: "mt-2 gap-1.5",
            pricingTableCardFee: "text-4xl font-bold tracking-tight",
            pricingTableCardFeePeriod: "text-sm text-muted-foreground",
            pricingTableCardPeriodToggle:
              "rounded-lg border border-border bg-background p-0.5",
            pricingTableCardFeaturesList: "gap-3",
            pricingTableCardFeaturesListItem: "gap-2.5",
            pricingTableCardFeaturesListItemContent:
              "text-sm text-muted-foreground",
            pricingTableCardFeaturesListItemTitle:
              "text-sm font-medium text-foreground",
            pricingTableCardFooterButton:
              "w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
            pricingTableCardFooterNotice:
              "text-center text-xs text-muted-foreground",
          },
        }}
      />
    </div>
  )
}
"use server"

import { auth, clerkClient } from "@clerk/nextjs/server"

export type CurrentUserPlan = {
  planName: string | null
  status: string | null
  payerType: "org" | "user" | null
}

export async function getCurrentUserPlan(): Promise<CurrentUserPlan> {
  const { userId, orgId } = await auth()
  if (!userId && !orgId) {
    return { planName: null, status: null, payerType: null }
  }

  const client = await clerkClient()

  try {
    if (orgId) {
      const subscription =
        await client.billing.getOrganizationBillingSubscription(orgId)
      const item = subscription.subscriptionItems[0]
      return {
        planName: item?.plan?.name ?? null,
        status: subscription.status,
        payerType: "org",
      }
    }

    const subscription =
      await client.billing.getUserBillingSubscription(userId!)
    const item = subscription.subscriptionItems[0]
    return {
      planName: item?.plan?.name ?? null,
      status: subscription.status,
      payerType: "user",
    }
  } catch {
    return { planName: null, status: null, payerType: null }
  }
}
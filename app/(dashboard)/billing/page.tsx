import { getBillingOverview } from "@/lib/actions/invoices";
import BillingClient from "@/components/billing/BillingClient";

export default async function BillingPage() {
  const overview = await getBillingOverview();
  return <BillingClient overview={overview} />;
}

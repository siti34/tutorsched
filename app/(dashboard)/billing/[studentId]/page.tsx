import { notFound } from "next/navigation";
import { getStudentInvoiceData } from "@/lib/actions/invoices";
import InvoiceClient from "@/components/billing/InvoiceClient";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const data = await getStudentInvoiceData(studentId);
  if (!data) notFound();
  return <InvoiceClient data={data} />;
}

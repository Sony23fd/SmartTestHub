import { connectToDatabase } from "@/lib/mongoose";
import { Submission } from "@/models/Submission";
import { notFound, redirect } from "next/navigation";
import PaymentClient from "./PaymentClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SubmissionPaymentPage({ params }: Props) {
  await connectToDatabase();
  const { id } = await params;

  const submission = await Submission.findById(id).lean();

  if (!submission) {
    notFound();
  }

  // If already paid, redirect straight to results
  if (submission.paymentStatus === "PAID") {
    redirect(`/submission/${id}/result`);
  }

  return <PaymentClient submissionId={id} />;
}

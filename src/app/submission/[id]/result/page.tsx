import ResultClient from "./ResultClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SubmissionResultPage({ params }: Props) {
  const { id } = await params;
  return <ResultClient submissionId={id} />;
}

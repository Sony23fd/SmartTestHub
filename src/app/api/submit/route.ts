import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Test, IScoringRule } from '@/models/Test';
import { Question } from '@/models/Question';
import { Submission } from '@/models/Submission';

/**
 * POST /api/submit
 *
 * Body:
 * {
 *   testId: string,
 *   responses: Array<{
 *     questionId: string,
 *     selectedOptionIndex: number   // 0-based index into question.options
 *   }>
 * }
 *
 * Steps:
 *  1. Validate input
 *  2. Load the Test and verify it exists
 *  3. Load all Questions for this test
 *  4. For each response, look up the question and grab the score of the chosen option
 *  5. Sum all scores → totalScore
 *  6. Match totalScore against Test.scoringRules (first matching min ≤ score ≤ max rule wins)
 *  7. Save Submission with paymentStatus: 'PENDING'
 *  8. Return result
 */
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // ── 1. Parse & validate body ──────────────────────────────────────────────
    const body = await req.json();
    const { testId, responses } = body as {
      testId: string;
      responses: { questionId: string; selectedOptionIndex: number }[];
    };

    if (!testId) {
      return NextResponse.json(
        { success: false, error: 'testId is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { success: false, error: 'responses must be a non-empty array' },
        { status: 400 }
      );
    }

    // ── 2. Load the Test ──────────────────────────────────────────────────────
    const test = await Test.findById(testId);
    if (!test) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      );
    }

    // ── 3. Load all Questions for this test ───────────────────────────────────
    const questions = await Question.find({ testId }).sort({ order: 1 });

    // Build a map for O(1) lookup: questionId → question doc
    const questionMap = new Map(
      questions.map((q) => [q._id.toString(), q])
    );

    // ── 4. Score each response ────────────────────────────────────────────────
    const scoredResponses: {
      questionId: string;
      selectedOptionIndex: number;
      score: number;
    }[] = [];

    for (const response of responses) {
      const { questionId, selectedOptionIndex } = response;

      if (!questionId) {
        return NextResponse.json(
          { success: false, error: 'Each response must include a questionId' },
          { status: 400 }
        );
      }

      const question = questionMap.get(questionId.toString());

      if (!question) {
        return NextResponse.json(
          {
            success: false,
            error: `Question ${questionId} does not belong to this test`,
          },
          { status: 400 }
        );
      }

      const optionCount = question.options.length;
      if (
        selectedOptionIndex === undefined ||
        selectedOptionIndex < 0 ||
        selectedOptionIndex >= optionCount
      ) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid selectedOptionIndex (${selectedOptionIndex}) for question "${question.text}". Valid range: 0–${optionCount - 1}`,
          },
          { status: 400 }
        );
      }

      const chosenOption = question.options[selectedOptionIndex];
      scoredResponses.push({
        questionId,
        selectedOptionIndex,
        score: chosenOption.score,
      });
    }

    // ── 5. Calculate total score ──────────────────────────────────────────────
    const totalScore = scoredResponses.reduce((sum, r) => sum + r.score, 0);

    // ── 6. Match scoringRules ─────────────────────────────────────────────────
    // Find the FIRST rule where min ≤ totalScore ≤ max
    const matchedRule: IScoringRule | undefined = (test.scoringRules ?? []).find(
      (rule: IScoringRule) => totalScore >= rule.min && totalScore <= rule.max
    );

    const resultText = matchedRule?.resultText ?? 'Үр дүн тодорхойгүй байна';
    const resultStatus = matchedRule?.status ?? 'UNKNOWN';

    // ── 7. Generate Unique 4-digit Short ID ──────────────────────────────────
    let shortId = Math.floor(1000 + Math.random() * 9000).toString();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const existing = await Submission.findOne({ shortId }).select('_id').lean();
      if (!existing) {
        isUnique = true;
      } else {
        shortId = Math.floor(1000 + Math.random() * 9000).toString();
        attempts++;
      }
    }

    // ── 8. Save Submission ────────────────────────────────────────────────────
    const submission = await Submission.create({
      testId,
      responses: scoredResponses,
      totalScore,
      resultText,
      resultStatus,
      paymentStatus: test.price === 0 ? 'PAID' : 'PENDING',
      shortId,
    });

    // ── 9. Return result ──────────────────────────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        data: {
          submissionId: submission._id,
          testId,
          totalScore,
          resultText,
          resultStatus,
          paymentStatus: submission.paymentStatus,
          shortId: submission.shortId,
          // Include test price so the frontend can show payment info
          price: test.price,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

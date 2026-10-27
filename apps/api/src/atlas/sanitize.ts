// "Answer first, then see the answer." These helpers strip answers out of content before it is
// sent to the browser. The answers are only returned by the routes that check MY answer.
import type { ChoiceQuestion, InterviewQuestion, Topic } from "@hexhammer/content";

export type PublicChoiceQuestion = Omit<ChoiceQuestion, "answerIndex" | "explanation">;

export function publicChoice(q: ChoiceQuestion): PublicChoiceQuestion {
  return { id: q.id, prompt: q.prompt, code: q.code, choices: q.choices, objective: q.objective };
}

export function publicInterview(q: InterviewQuestion) {
  return {
    id: q.id,
    tags: q.tags,
    difficulty: q.difficulty,
    kind: q.kind,
    prompt: q.prompt,
    code: q.code,
    // How many points a strong answer covers, without saying which (that would give it away).
    expectedCount: q.expectedElements.length,
  };
}

// The whole topic, safe to show before I have answered anything.
export function publicTopic(t: Topic) {
  return {
    ...t,
    knowledgeChecks: t.knowledgeChecks.map(publicChoice),
    assessment: t.assessment ? { passingScore: t.assessment.passingScore, questions: t.assessment.questions.map(publicChoice) } : null,
    exercises: t.exercises.map((ex) => (ex.kind === "predict" || ex.kind === "debug" ? { ...ex, question: publicChoice(ex.question) } : ex)),
    interviewQuestions: t.interviewQuestions.map(publicInterview),
  };
}

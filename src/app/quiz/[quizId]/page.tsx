import QuizClient from './QuizClient';

import { allQuizzes } from '@/lib/data-loader';

export function generateStaticParams() {
  return allQuizzes.map((q) => ({ quizId: q.id }));
}

export default function QuizPage() {
  return <QuizClient />;
}

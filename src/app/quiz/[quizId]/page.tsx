import QuizClient from './QuizClient';

import japanQuizzes from '@/data/quizzes/japan.json';
import europeQuizzes from '@/data/quizzes/europe.json';
import chinaQuizzes from '@/data/quizzes/china.json';
import worldQuizzes from '@/data/quizzes/world.json';

export function generateStaticParams() {
  const allQuizzes = [...japanQuizzes, ...europeQuizzes, ...chinaQuizzes, ...worldQuizzes];
  return allQuizzes.map((q) => ({ quizId: q.id }));
}

export default function QuizPage() {
  return <QuizClient />;
}

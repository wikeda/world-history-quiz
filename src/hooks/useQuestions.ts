import questionsJson from '../data/questions.json';
import { Question } from '../domain/types';

const QUESTIONS = questionsJson as Question[];

export function useQuestions(): Question[] {
  return QUESTIONS;
}

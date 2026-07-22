export const QUOTES: { text: string; author: string }[] = [
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Well begun is half done.", author: "Aristotle" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Focus is about saying no.", author: "Steve Jobs" },
  { text: "Discipline equals freedom.", author: "Jocko Willink" },
  { text: "Slow is smooth. Smooth is fast.", author: "Navy SEALs" },
  { text: "The obstacle is the way.", author: "Marcus Aurelius" },
  { text: "Deep work is the superpower of the 21st century.", author: "Cal Newport" },
  { text: "How you do anything is how you do everything.", author: "T. Harv Eker" },
];

export function quoteOfDay(): { text: string; author: string } {
  const day = Math.floor(Date.now() / 86_400_000);
  return QUOTES[day % QUOTES.length];
}

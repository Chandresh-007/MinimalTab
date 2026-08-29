const QUOTES = [
  // Biblical
  { text: "I can do all things through Christ who strengthens me.", author: "Philippians 4:13" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged.", author: "Joshua 1:9" },
  { text: "The Lord is my shepherd; I shall not want.", author: "Psalm 23:1" },
  { text: "Trust in the Lord with all your heart, and lean not on your own understanding.", author: "Proverbs 3:5" },
  { text: "For God has not given us a spirit of fear, but of power and of love and of a sound mind.", author: "2 Timothy 1:7" },
  { text: "She is clothed with strength and dignity, and she laughs without fear of the future.", author: "Proverbs 31:25" },
  { text: "Weeping may endure for a night, but joy comes in the morning.", author: "Psalm 30:5" },
  { text: "And we know that all things work together for good to those who love God.", author: "Romans 8:28" },
  { text: "The Lord will fight for you; you need only to be still.", author: "Exodus 14:14" },
  { text: "Faith is the substance of things hoped for, the evidence of things not seen.", author: "Hebrews 11:1" },
  { text: "Cast all your anxiety on Him because He cares for you.", author: "1 Peter 5:7" },
  { text: "In this world you will have trouble. But take heart! I have overcome the world.", author: "John 16:33" },
  // Strong / popular
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "What we think, we become.", author: "Buddha" },
  { text: "Whether you think you can or you think you can't — you're right.", author: "Henry Ford" },
  { text: "Hard times create strong men. Strong men create good times.", author: "G. Michael Hopf" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "The obstacle is the way.", author: "Marcus Aurelius" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" }
];
function quoteOfDay() {
  const day = Math.floor(Date.now() / 864e5);
  return QUOTES[day % QUOTES.length];
}
export {
  QUOTES,
  quoteOfDay
};

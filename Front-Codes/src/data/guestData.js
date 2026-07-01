// src/data/guestData.js
// داده‌ی دمو برای «حالت مهمان» (MVP) — کتاب‌ها و بازی‌های آموزشی کلاس اول.
// نام فایل‌ها، شماره و عنوان‌ها دقیقاً از فایل‌های واقعی در public/games استخراج شده‌اند.
// مسیر بازی‌ها مرحله‌ای است: هر بازی تا وقتی بازی قبلی همان کتاب کامل نشود قفل است.

export const GUEST_CLASSES = [
  { id: 'g-class-1', name: 'کلاس اول' },
];

export const GUEST_BOOKS = [
  {
    id: 'demo-math',
    class_id: 'g-class-1',
    title: 'ریاضی اول',
    subject: 'ریاضی',
    games: [
      { id: 'math-1',  order: 1,  title: 'جزیره حیوانات',        coin_reward: 10, gameUrl: '/games/math-first-grade-game-one.html' },
      { id: 'math-2',  order: 2,  title: 'قطار اعداد',           coin_reward: 10, gameUrl: '/games/math-first-grade-game-two.html' },
      { id: 'math-3',  order: 3,  title: 'شکارچی کوچک',          coin_reward: 10, gameUrl: '/games/math-first-grade-game-three.html' },
      { id: 'math-4',  order: 4,  title: 'هیولاهای گرسنه',       coin_reward: 12, gameUrl: '/games/math-first-grade-game-four.html' },
      { id: 'math-5',  order: 5,  title: 'آشپز کوچولو',          coin_reward: 12, gameUrl: '/games/math-first-grade-game-five.html' },
      { id: 'math-6',  order: 6,  title: 'سفر ریتم',             coin_reward: 12, gameUrl: '/games/math-first-grade-game-six.html' },
      { id: 'math-7',  order: 7,  title: 'خرگوش مهربان',         coin_reward: 14, gameUrl: '/games/math-first-grade-game-seven.html' },
      { id: 'math-8',  order: 8,  title: 'یادگیری اعداد فارسی',  coin_reward: 14, gameUrl: '/games/math-first-grade-game-eight.html' },
      { id: 'math-9',  order: 9,  title: 'حدس اعداد فضایی',      coin_reward: 15, gameUrl: '/games/math-first-grade-game-nine.html' },
      { id: 'math-10', order: 10, title: 'سفر ریاضی',            coin_reward: 15, gameUrl: '/games/math-first-grade-game-ten.html' },
    ],
  },
  {
    id: 'demo-science',
    class_id: 'g-class-1',
    title: 'علوم اول',
    subject: 'علوم',
    games: [
      { id: 'sci-1', order: 1, title: 'یادگیری سایه',        coin_reward: 12, gameUrl: '/games/science-first-grade-game-one.html' },
      { id: 'sci-2', order: 2, title: 'آزمایشگاه گوجه',      coin_reward: 12, gameUrl: '/games/science-first-grade-game-two.html' },
      { id: 'sci-3', order: 3, title: 'آزمایشگاه جادویی آب', coin_reward: 14, gameUrl: '/games/science-first-grade-game-three.html' },
    ],
  },
  {
    id: 'demo-quran',
    class_id: 'g-class-1',
    title: 'قرآن اول',
    subject: 'قرآن',
    games: [
      { id: 'quran-1', order: 1, title: 'قطار قرآن — سوره توحید', coin_reward: 15, gameUrl: '/games/quran-first-grade-game-one.html' },
    ],
  },
  {
    id: 'demo-writing',
    class_id: 'g-class-1',
    title: 'نگارش اول',
    subject: 'نگارش',
    games: [
      { id: 'writing-4', order: 1, title: 'نگارش حرف سین', coin_reward: 15, gameUrl: '/games/writing-first-grade-game-four.html' },
    ],
  },
  {
    // کتاب بدون بازی — برای نمایش نوتیفیکیشن
    id: 'demo-farsi',
    class_id: 'g-class-1',
    title: 'فارسی اول',
    subject: 'فارسی',
    games: [],
  },
];

export const GUEST_USER = {
  id: 'guest',
  username: 'guest',
  firstName: 'کاربر',
  lastName: 'مهمان',
  role: 'student',
  isGuest: true,
  isProfileComplete: true,
  avatarUrl: null,
  schoolId: null,
};

// ─── جست‌وجو ───
export function findGuestBook(id) {
  return GUEST_BOOKS.find((b) => String(b.id) === String(id)) || null;
}

// بازی‌های یک کتاب به ترتیب order
export function getGuestBookGames(bookId) {
  const book = findGuestBook(bookId);
  if (!book) return { book: null, games: [] };
  const games = [...(book.games || [])].sort((a, b) => a.order - b.order);
  return { book, games };
}

// یافتن یک بازی + کتاب + بازی قبلی/بعدی (بر اساس ترتیب)
export function findGuestGame(gameId) {
  for (const book of GUEST_BOOKS) {
    const ordered = [...(book.games || [])].sort((a, b) => a.order - b.order);
    const idx = ordered.findIndex((g) => String(g.id) === String(gameId));
    if (idx !== -1) {
      return {
        game: ordered[idx],
        book,
        prevGame: ordered[idx - 1] || null,
        nextGame: ordered[idx + 1] || null,
        index: idx,
      };
    }
  }
  return null;
}

// ─── مدیریت سکه و پیشرفت مهمان به‌صورت محلی ───
const GUEST_COINS_KEY = 'guestCoins';
const GUEST_DONE_KEY = 'guestCompletedGames';

export function getGuestCoins() {
  return parseInt(localStorage.getItem(GUEST_COINS_KEY) || '0', 10);
}

export function addGuestCoins(amount) {
  const total = getGuestCoins() + amount;
  localStorage.setItem(GUEST_COINS_KEY, String(total));
  return total;
}

export function getGuestCompleted() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_DONE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function isGuestGameCompleted(gameId) {
  return getGuestCompleted().includes(String(gameId));
}

export function markGuestCompleted(gameId) {
  const done = new Set(getGuestCompleted());
  done.add(String(gameId));
  localStorage.setItem(GUEST_DONE_KEY, JSON.stringify([...done]));
}

// آیا بازی باز است؟ (بازی اول همیشه باز؛ بقیه نیازمند تکمیل بازی قبلی)
export function isGuestGameUnlocked(bookId, gameId) {
  const { games } = getGuestBookGames(bookId);
  const idx = games.findIndex((g) => String(g.id) === String(gameId));
  if (idx <= 0) return idx === 0; // بازی اول باز، بازی ناموجود بسته
  return isGuestGameCompleted(games[idx - 1].id);
}

export function resetGuestData() {
  localStorage.removeItem(GUEST_COINS_KEY);
  localStorage.removeItem(GUEST_DONE_KEY);
}

export function isGuest() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    return !!u?.isGuest;
  } catch {
    return false;
  }
}

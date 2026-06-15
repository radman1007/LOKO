// src/data/ticketData.js

// تیکت‌ها
let tickets = [];

// بارگذاری تیکت‌ها از localStorage
export const loadTickets = () => {
  const saved = localStorage.getItem('luko_tickets');
  if (saved) {
    tickets = JSON.parse(saved);
  } else {
    // تیکت‌های نمونه
    tickets = [
      {
        id: 1,
        title: 'مشکل در ورود به لوکو کلاب',
        description: 'وقتی میخوام وارد لوکو کلاب بشم صفحه خالی میاد',
        category: 'technical',
        status: 'answered',
        createdAt: '۱۴۰۵/۰۲/۲۰',
        createdBy: 'student1',
        createdByName: 'علی حسینی',
        createdByRole: 'student',
        school: 'مدرسه الف',
        answer: 'لطفا کش مرورگرت رو پاک کن و دوباره امتحان کن',
        answeredAt: '۱۴۰۵/۰۲/۲۱',
        answeredBy: 'abolfazlmodir'
      },
      {
        id: 2,
        title: 'درخواست افزودن ویدیو جدید',
        description: 'لطفا ویدیوهای بیشتری در بخش علوم قرار بدید',
        category: 'request',
        status: 'pending',
        createdAt: '۱۴۰۵/۰۲/۲۲',
        createdBy: 'teacher1',
        createdByName: 'خانم معلمی',
        createdByRole: 'teacher',
        school: 'مدرسه الف',
        answer: null,
        answeredAt: null,
        answeredBy: null
      },
      {
        id: 3,
        title: 'مشکل در ثبت نمرات',
        description: 'سیستم نمرات دانش‌آموزان رو درست ثبت نمیکنه',
        category: 'technical',
        status: 'pending',
        createdAt: '۱۴۰۵/۰۲/۲۳',
        createdBy: 'schoolmanager',
        createdByName: 'مدیر مدرسه الف',
        createdByRole: 'school_manager',
        school: 'مدرسه الف',
        answer: null,
        answeredAt: null,
        answeredBy: null
      }
    ];
    localStorage.setItem('luko_tickets', JSON.stringify(tickets));
  }
  return tickets;
};

export const saveTickets = (newTickets) => {
  tickets = newTickets;
  localStorage.setItem('luko_tickets', JSON.stringify(tickets));
};

// دریافت تیکت‌ها بر اساس نقش کاربر
export const getTicketsByUser = (user) => {
  loadTickets();
  
  if (!user) return [];
  
  switch(user.role) {
    case 'admin':
      // مدیر تیم همه تیکت‌ها را می‌بیند
      return tickets;
    case 'school_manager':
      // مدیر مدرسه تیکت‌های مدرسه خود و تیکت‌های خودش را می‌بیند
      return tickets.filter(t => t.school === user.school || t.createdBy === user.username);
    case 'teacher':
      // معلم فقط تیکت‌های خود را می‌بیند
      return tickets.filter(t => t.createdBy === user.username);
    case 'student':
      // دانش‌آموز فقط تیکت‌های خود را می‌بیند
      return tickets.filter(t => t.createdBy === user.username);
    default:
      return [];
  }
};

// ایجاد تیکت جدید (همه نقش‌ها به جز والدین)
export const createTicket = (user, title, description, category) => {
  loadTickets();
  
  const newTicket = {
    id: Date.now(),
    title,
    description,
    category,
    status: 'pending',
    createdAt: new Date().toLocaleDateString('fa-IR'),
    createdBy: user.username,
    createdByName: user.name || user.username,
    createdByRole: user.role,
    school: user.school || null,
    answer: null,
    answeredAt: null,
    answeredBy: null
  };
  
  tickets.unshift(newTicket);
  saveTickets(tickets);
  return newTicket;
};

// پاسخ به تیکت (فقط مدیر تیم)
export const answerTicket = (ticketId, answer) => {
  loadTickets();
  
  const index = tickets.findIndex(t => t.id === ticketId);
  if (index !== -1) {
    tickets[index] = {
      ...tickets[index],
      status: 'answered',
      answer,
      answeredAt: new Date().toLocaleDateString('fa-IR'),
      answeredBy: 'admin'
    };
    saveTickets(tickets);
    return tickets[index];
  }
  return null;
};

// دریافت آمار تیکت‌ها
export const getTicketStats = (user) => {
  const userTickets = getTicketsByUser(user);
  return {
    total: userTickets.length,
    pending: userTickets.filter(t => t.status === 'pending').length,
    answered: userTickets.filter(t => t.status === 'answered').length
  };
};
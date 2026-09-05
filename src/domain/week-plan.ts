export type SessionType = "lesson" | "review" | "group" | "islamic";

export type WeekSession = {
  id: string;
  childId: string;
  courseId: string;
  title: string;
  date: string;
  startTime: string;
  duration: number;
  type: SessionType;
  location: string;
  status: "planned" | "live" | "done";
  note: string;
};

const sessions: WeekSession[] = [
  { id: "session-fractions", childId: "adam", courseId: "fractions", title: "Fractions", date: "2026-09-07", startTime: "09:00", duration: 45, type: "lesson", location: "À la maison", status: "planned", note: "Représenter et comparer des fractions avec des objets du quotidien." },
  { id: "session-arabic", childId: "adam", courseId: "lettres-arabes", title: "Arabe : les lettres", date: "2026-09-08", startTime: "10:00", duration: 30, type: "islamic", location: "À la maison", status: "planned", note: "Écouter les sons, tracer les formes puis lire une syllabe." },
  { id: "session-reading", childId: "sara", courseId: "lecture-francaise", title: "Lecture française", date: "2026-09-08", startTime: "13:00", duration: 40, type: "lesson", location: "À la maison", status: "planned", note: "Trouver l’idée principale et la justifier avec une preuve du texte." },
  { id: "session-circle", childId: "adam", courseId: "ecosystems", title: "Classe collaborative · Sciences", date: "2026-09-09", startTime: "16:00", duration: 60, type: "group", location: "Classe en ligne · 6 places", status: "live", note: "Table ronde : construire une chaîne alimentaire avec le tuteur." },
  { id: "session-quran", childId: "adam", courseId: "memorisation-coran", title: "Révision du Coran", date: "2026-09-10", startTime: "09:00", duration: 25, type: "islamic", location: "À la maison", status: "planned", note: "Répétition par segments et récitation sans support." },
  { id: "session-review", childId: "sara", courseId: "english-speaking", title: "English speaking", date: "2026-09-11", startTime: "14:00", duration: 35, type: "review", location: "À la maison", status: "planned", note: "Practice introducing yourself and asking a simple question." },
];

const blockedSlots = new Set<string>(["2026-09-07|12:00", "2026-09-07|15:00"]);

export function listWeekSessions(childId?: string) {
  return sessions.filter((session) => !childId || session.childId === childId);
}

export function moveWeekSession(id: string, date: string, startTime: string) {
  const session = sessions.find((item) => item.id === id);
  if (!session) return undefined;
  session.date = date;
  session.startTime = startTime;
  return session;
}

export function getWeekSession(id: string) {
  return sessions.find((session) => session.id === id);
}

export function listBlockedSlots() {
  return [...blockedSlots];
}

export function setBlockedSlot(date: string, startTime: string, blocked: boolean) {
  const key = `${date}|${startTime}`;
  if (blocked) blockedSlots.add(key);
  else blockedSlots.delete(key);
  return { date, startTime, blocked };
}

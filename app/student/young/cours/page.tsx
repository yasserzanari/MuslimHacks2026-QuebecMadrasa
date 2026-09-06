import Image from "next/image";
import Link from "next/link";

const courses = [
  { href: "/student/young/cours/fractions", icon: "¾", title: "Fractions simples", text: "Partager, comparer et reconnaître les parts d’un tout.", color: "green", time: "15 min" },
  { href: "/student/young/sceance/memorisation-coran", icon: "☽", title: "Mémorisation du Coran", text: "Apprendre un court verset avec écoute et répétition.", color: "gold", time: "10 min" },
  { href: "/student/young/sceance/lettres-arabes", icon: "ب", title: "Lettres arabes", text: "Reconnaître les premières lettres avec un petit jeu.", color: "purple", time: "5 min" },
];

export default function YoungCoursesPage() {
  return <main className="young-dashboard-page"><div className="young-simple-page"><header className="young-simple-header"><Link href="/student/young" className="young-brand"><span className="young-brand-mark">☪</span><span><strong>Madrasa</strong><small>Québec</small></span></Link><Link href="/student/young" className="young-back-link">← Mon accueil</Link></header><section className="young-simple-intro"><p className="young-eyebrow">MES COURS</p><h1>Choisis ton aventure</h1><p>Deux petites missions, pensées pour apprendre en bougeant et en s’amusant.</p></section><section className="young-course-grid">{courses.map((course) => <Link href={course.href} className={`young-course-tile ${course.color}`} key={course.href}><div className="young-course-icon">{course.icon}</div><div><span>{course.time} · À ton rythme</span><h2>{course.title}</h2><p>{course.text}</p><b>Commencer →</b></div></Link>)}</section></div></main>;
}

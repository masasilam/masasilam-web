import {
  Newspaper,
  Church, Leaf, BookText, Building2, Gem, Flower2, User, TrendingUp,
  Palette, Drama, BookMarked, Baby, Users, Lightbulb, Camera, PawPrint,
  Scale, Smile, FlaskConical, Landmark, Globe, Stethoscope, ShieldAlert,
  Heart, Scissors, Activity, BookHeart, Image, Laptop, Feather, Calculator,
  ChefHat, Music, GraduationCap, Target, Plane, Gamepad2, Brain, Map, Home,
  Clock, Languages, Theater, Wrench, Car, Sparkles, Dumbbell, BookOpenCheck,
} from 'lucide-react'

export const genreIcons = {
  'agama': Church, 'alam': Leaf, 'alkitab': BookText, 'arsitektur': Building2,
  'barang-antik-koleksi': Gem, 'berkebun': Flower2, 'biografi-otobiografi': User,
  'bisnis-ekonomi': TrendingUp, 'desain': Palette, 'drama': Drama, 'fiksi': BookMarked,
  'fiksi-anak': Baby, 'fiksi-remaja': Users, 'filsafat': Lightbulb, 'fotografi': Camera,
  'hewan-peliharaan': PawPrint, 'hukum': Scale, 'humor': Smile, 'ilmu-pengetahuan': FlaskConical,
  'ilmu-politik': Landmark, 'ilmu-sosial': Globe, 'kedokteran': Stethoscope,
  'kejahatan-nyata': ShieldAlert, 'keluarga-hubungan': Heart, 'kerajinan-hobi': Scissors,
  'kesehatan-kebugaran': Activity, 'koleksi-sastra': BookHeart, 'komik-novel-grafis': Image,
  'komputer': Laptop, 'kritik-sastra': Feather, 'matematika': Calculator,
  'memasak-kuliner': ChefHat, 'musik': Music, 'nonfiksi-anak': GraduationCap,
  'nonfiksi-remaja': BookOpenCheck, 'olahraga-rekreasi': Dumbbell, 'panduan-belajar': Target,
  'pendidikan': GraduationCap, 'pengembangan-diri': Sparkles, 'perjalanan': Plane,
  'permainan-aktivitas': Gamepad2, 'psikologi': Brain, 'puisi': Feather, 'referensi': Map,
  'rumah-kehidupan': Home, 'sejarah': Clock, 'seni': Palette, 'seni-disiplin-bahasa': Languages,
  'seni-pertunjukan': Theater, 'studi-bahasa': Languages, 'teknologi-rekayasa': Wrench,
  'transportasi': Car, 'tubuh-pikiran-jiwa': Sparkles,
}

export const getGenreIcon = slug => genreIcons[slug] || Newspaper
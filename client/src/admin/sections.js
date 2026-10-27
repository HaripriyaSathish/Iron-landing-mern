import {
  BookHeart,
  ChevronsRight,
  Compass,
  Gem,
  HeartHandshake,
  Images,
  Languages,
  LayoutDashboard,
  LayoutTemplate,
  Megaphone,
  MailCheck,
  MessageCircleHeart,
  MessageSquareQuote,
  Music,
  PanelBottom,
  PhoneCall,
  Route,
  Settings2,
  Share2,
  Shirt,
  Sparkles,
} from 'lucide-react'

// Sidebar folders. Page sections are listed in the order they appear on the website.
// New landing-page sections get added to the right group here.
export const groups = [
  {
    id: 'setup',
    title: 'Site Setup',
    icon: Settings2,
    items: [
      { path: '/admin/branding', icon: Sparkles, title: 'Search & Branding', hint: 'Title, keywords & favicon' },
      { path: '/admin/menu', icon: Compass, title: 'Navbar & Menu', hint: 'Logo, links & top button' },
      { path: '/admin/offer', icon: Megaphone, title: 'Flash Offer Banner', hint: 'Top strip for offers & free pickup' },
      { path: '/admin/quick-connect', icon: MessageCircleHeart, title: 'Floating Buttons', hint: 'Call, WhatsApp & email' },
      { path: '/admin/footer', icon: PanelBottom, title: 'Footer', hint: 'Intro, links & copyright' },
      { path: '/admin/music', icon: Music, title: 'Background Music', hint: 'Soft music & play button' },
      { path: '/admin/languages', icon: Languages, title: 'Languages', hint: 'Tamil, French & more' },
      { path: '/admin/email', icon: MailCheck, title: 'Email Alerts', hint: 'SMTP & password alerts' },
    ],
  },
  {
    id: 'sections',
    title: 'Page Sections',
    icon: LayoutTemplate,
    items: [
      { path: '/admin/slider', icon: Images, title: 'Hero Slider', hint: 'Big welcome banner' },
      { path: '/admin/ticker', icon: ChevronsRight, title: 'Moving Offer Line', hint: 'Free pickup, courier & more' },
      { path: '/admin/story', icon: BookHeart, title: 'About Us', hint: 'Your story, photo & highlights' },
      { path: '/admin/services', icon: Shirt, title: 'Services & Prices', hint: 'Service cards & rates' },
      { path: '/admin/specialties', icon: Gem, title: 'Specialties & B2B', hint: 'Saree Polish & hotel service' },
      { path: '/admin/promise', icon: HeartHandshake, title: 'Why Choose Us', hint: 'Reasons customers trust you' },
      { path: '/admin/process', icon: Route, title: 'How It Works', hint: 'Steps from booking to ready' },
      { path: '/admin/reviews', icon: MessageSquareQuote, title: 'Testimonials', hint: 'Reviews & star ratings' },
      { path: '/admin/contact', icon: PhoneCall, title: 'Contact & Booking', hint: 'Phone, map & hours' },
      { path: '/admin/follow-us', icon: Share2, title: 'Follow Us', hint: 'Instagram, YouTube, WhatsApp & more' },
    ],
  },
]

export const home = { path: '/admin', end: true, icon: LayoutDashboard, title: 'Welcome Desk', hint: 'Your site at a glance' }

// Flat list (dashboard first) for the dashboard tiles and the top bar title
const sections = [home, ...groups.flatMap((g) => g.items)]

export default sections

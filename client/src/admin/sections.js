import {
  BookHeart,
  Compass,
  HeartHandshake,
  Images,
  LayoutDashboard,
  LayoutTemplate,
  MailCheck,
  MessageCircleHeart,
  MessageSquareQuote,
  PanelBottom,
  PhoneCall,
  Route,
  Settings2,
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
      { path: '/admin/quick-connect', icon: MessageCircleHeart, title: 'Floating Buttons', hint: 'Call, WhatsApp & email' },
      { path: '/admin/footer', icon: PanelBottom, title: 'Footer', hint: 'Intro, socials & copyright' },
      { path: '/admin/email', icon: MailCheck, title: 'Email Alerts', hint: 'SMTP & password alerts' },
    ],
  },
  {
    id: 'sections',
    title: 'Page Sections',
    icon: LayoutTemplate,
    items: [
      { path: '/admin/slider', icon: Images, title: 'Hero Slider', hint: 'Big welcome banner' },
      { path: '/admin/story', icon: BookHeart, title: 'About Us', hint: 'Your story, photo & highlights' },
      { path: '/admin/services', icon: Shirt, title: 'Services & Prices', hint: 'Service cards & rates' },
      { path: '/admin/promise', icon: HeartHandshake, title: 'Why Choose Us', hint: 'Reasons customers trust you' },
      { path: '/admin/process', icon: Route, title: 'How It Works', hint: 'Steps from booking to ready' },
      { path: '/admin/reviews', icon: MessageSquareQuote, title: 'Testimonials', hint: 'Reviews & star ratings' },
      { path: '/admin/contact', icon: PhoneCall, title: 'Contact & Booking', hint: 'Phone, map & hours' },
    ],
  },
]

export const home = { path: '/admin', end: true, icon: LayoutDashboard, title: 'Welcome Desk', hint: 'Your site at a glance' }

// Flat list (dashboard first) for the dashboard tiles and the top bar title
const sections = [home, ...groups.flatMap((g) => g.items)]

export default sections

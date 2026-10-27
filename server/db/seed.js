// Seed data = exact wording from the Figma design.
// Images are left empty on purpose; they are uploaded from the admin panel.

// Favicon and share image are uploaded from the admin panel.
export const seoSettings = {
  site_title: "Iron Me Ka | Expert Care for Every Fabric",
  meta_description:
    "Professional saree care, ironing, steaming and finishing — handled with care and precision. Book a fabric care service with Iron Me Ka.",
  meta_keywords:
    "saree care, saree ironing, professional ironing, steam ironing, fabric care, saree finishing, silk saree care, ironing service",
  og_title: "Iron Me Ka | Expert Care for Every Fabric",
  og_description: "Professional saree care, ironing, steaming and finishing — handled with care and precision.",
};

export const navbarSettings = {
  logo_alt: "Iron Me Ka",
  cta_text: "Book a Service",
  cta_link: "#contact",
};

export const navLinks = [
  { label: "Home", target: "#home" },
  { label: "About Us", target: "#about" },
  { label: "Services", target: "#services" },
  { label: "Why Choose Us", target: "#why-choose-us" },
  { label: "Reviews", target: "#reviews" },
  { label: "Contact", target: "#contact" },
];

export const quickContacts = [
  { type: "call", label: "Call Us", value: "+91 82206 95123", message: null },
  {
    type: "whatsapp",
    label: "Chat on WhatsApp",
    value: "918220695123",
    message: "Hi, I would like to book a fabric care service.",
  },
  { type: "email", label: "Email Us", value: "ironmeka605@gmail.com", message: null },
];

const heroCommon = {
  heading: "Expert Care for Every Fabric",
  description: "Professional saree care, ironing, steaming and finishing — handled with care and precision.",
  primary_btn_text: "Book a Service",
  primary_btn_link: "#contact",
  secondary_btn_text: "View Services",
  secondary_btn_link: "#services",
};

export const heroSlides = [
  { ...heroCommon, tagline: "Saree Care", image_alt: "Maroon silk saree with gold zari border" },
  { ...heroCommon, tagline: "Professional Ironing", image_alt: "Steam iron pressing a white garment" },
  { ...heroCommon, tagline: "Neatly Finished", image_alt: "Neatly folded silk sarees and veshtis" },
];

// Paragraphs are separated by a blank line.
export const aboutSection = {
  tagline: "About Us",
  heading: "Care That Makes Every Fabric Feel Special",
  content: [
    "At Iron Me.Ka, we believe every garment carries a story — from the silk saree worn at a wedding to the crisp veshti for a festival morning. Our trained team handles each fabric by hand, choosing the right heat, steam and finish for its weave.",
    "With a deep respect for traditional wear and an eye for detail, we deliver pieces that look, feel and drape their very best.",
  ].join("\n\n"),
  image_alt: "Woman carefully pleating a cream and gold silk saree",
  // Badge on the photo corner: left empty, so it stays hidden until the client fills it in
  badge_value: null,
  badge_label: null,
};

// icon = lucide-react icon name, picked from a list in the admin panel
export const aboutHighlights = [
  { icon: "Award", title: "Quality Finishing" },
  { icon: "Feather", title: "Gentle Fabric Care" },
  { icon: "HandHeart", title: "Professional Handling" },
];

export const servicesSection = {
  tagline: "What We Do",
  heading: "Our Fabric Care Services",
  subheading: "Specialized care and finishing for your everyday wear and traditional fabrics.",
  price_label: "From",
  btn_text: "Book Now",
  btn_link: "#contact",
};

// price in rupees; card numbers (01, 02...) come from the display order
export const services = [
  { title: "Saree Rolling", description: "Neat and professional rolling for easy storage and handling.", price: 60 },
  { title: "Towel Ironing & Refreshing", description: "Fresh, neat and comfortable finishing for towels.", price: 20 },
  { title: "Coat & Delicate Fabric Steam Refresh", description: "Gentle steam treatment for coats and delicate fabrics.", price: 150 },
  { title: "Cotton Veshti Starching & Polishing", description: "Crisp starching and polished finishing for cotton veshti.", price: 80 },
  { title: "Silk Veshti Polishing", description: "Careful polishing to maintain the premium silk appearance.", price: 120 },
  { title: "Bed Sheet & Cover Ironing", description: "Smooth and neatly finished bed sheets and covers.", price: 40 },
  { title: "Saree Pre-Pleating", description: "Ready-to-wear pre-pleating for convenient styling.", price: 250 },
  { title: "Saree Polishing", description: "Professional polishing to enhance the saree's finish and appearance.", price: 150 },
  { title: "Cotton Saree Starching & Polishing", description: "Crisp starching with a clean, polished finish.", price: 120 },
  { title: "Saree Folding", description: "Neat and careful folding for organized storage.", price: 40 },
];

export const whySection = {
  tagline: "Why Choose Us",
  heading: "The Iron Me.Ka Difference",
};

export const whyFeatures = [
  { icon: "ShieldCheck", title: "Professional Fabric Care", description: "Every fabric receives appropriate care." },
  { icon: "Flower2", title: "Specialized Saree Care", description: "Dedicated finishing for sarees and traditional wear." },
  { icon: "Feather", title: "Delicate Fabric Handling", description: "Careful treatment for premium and delicate materials." },
  { icon: "Award", title: "Neat Premium Finish", description: "Consistent, clean and polished results." },
];

export const howSection = {
  tagline: "How It Works",
  heading: "Simple, Careful, Complete",
};

// Step numbers (01, 02...) come from the display order
export const howSteps = [
  { icon: "ClipboardList", title: "Choose Your Service", description: "Select the service you need." },
  { icon: "Hand", title: "Hand Over Your Clothes", description: "Give us your garments for professional care." },
  { icon: "WandSparkles", title: "Expert Care & Finishing", description: "Our team carefully handles and finishes them." },
  { icon: "CircleCheck", title: "Ready to Wear", description: "Receive your fresh, neat and beautifully finished clothes." },
];

export const testimonialsSection = {
  tagline: "Testimonials",
  heading: "Loved by Our Customers",
};

// The avatar letter comes from the first letter of the name
export const testimonials = [
  {
    quote: "My Kanjivaram silks came back beautifully polished and rolled. They treat every saree like it's their own.",
    name: "Lakshmi R.",
    role: "Verified customer",
    rating: 5,
  },
  {
    quote: "The silk veshti polishing for my wedding was flawless. Crisp, shining and on time.",
    name: "Arun Kumar",
    role: "Verified customer",
    rating: 5,
  },
  {
    quote: "Pre-pleating has saved me so much time before functions. Perfect pleats every single time!",
    name: "Priya S.",
    role: "Verified customer",
    rating: 5,
  },
  {
    quote: "Gentle with delicate fabrics and very professional. My go-to for all traditional wear.",
    name: "Meena V.",
    role: "Verified customer",
    rating: 5,
  },
];

// Wording from the design; phone, WhatsApp, email and address are the real business details.
// Address line breaks are kept as typed. Empty map_url = open Google Maps search for the address.
export const contactSection = {
  tagline: "Book Today",
  heading: "Give Your Clothes the Care They Deserve",
  description:
    "From everyday ironing to delicate saree and traditional wear care, we make every piece look its best.",
  primary_btn_text: "Book a Service",
  secondary_btn_text: "WhatsApp Us",
  phone: "+91 8220695123",
  whatsapp: "+91 8220695123",
  whatsapp_message: "Hi, I would like to book a fabric care service.",
  email: "ironmeka605@gmail.com",
  address: "6 Vincent de Paul street,\nCOLAS NAGAR,\nPONDICHERRY - 605001",
  map_url: null,
  business_hours: "Mon–Sat 9:00 AM – 8:00 PM · Sun 10:00 AM – 2:00 PM",
};

// {year} is replaced with the current year on the website
export const footerSettings = {
  about_text:
    "Premium saree and fabric care — rolling, pleating, polishing, starching and steaming, done by hand with precision.",
  links_title: "Quick Links",
  services_title: "Services",
  services_limit: 6,
  contact_title: "Contact",
  hours_short: "Mon–Sat 9 AM – 8 PM",
  socials_title: "Follow Us",
  socials_text: "Stay connected for offers, saree care tips and our latest work.",
  copyright_text: "© {year} Iron Me.Ka. All rights reserved.",
  // Sample number: the client enters the real one in Admin → Footer
  registration_label: "Reg. No.",
  registration_number: "UDYAM-PY-00-0000000",
};

// Placeholder profile links: replace with the real pages from the admin panel
export const socialLinks = [
  { platform: "instagram", url: "https://www.instagram.com/" },
  { platform: "youtube", url: "https://www.youtube.com/" },
  { platform: "whatsapp", url: "https://wa.me/919790263322" },
  { platform: "telegram", url: "https://t.me/+919790263322" },
];

// Flash offer strip above the header: starts with the free pickup & delivery offer
export const offerBar = {
  enabled: true,
  // Sample offer for the client to replace in Admin → Flash Offer Banner (free pickup lives in the moving line)
  badge_text: "Special Offer",
  message: "Get 10% OFF on your first saree polishing order",
  link_text: null,
  link_url: null,
  ends_at: null,
};

// Moving line under the hero. Icon keys come from client/src/lib/icons.js; **words** are highlighted
export const tickerItems = [
  { icon: "Truck", text: "**FREE** pickup & delivery within 5 km on orders above ₹1500" },
  { icon: "Wallet", text: "Below ₹1500, just **₹100** service charge" },
  { icon: "Package", text: "**Courier service** available" },
];

// Email alerts start switched off; SMTP details are entered in the admin panel
export const mailSettings = {
  enabled: false,
  smtp_port: 587,
  from_name: "Iron Me Ka",
  alert_email: "ironmeka605@gmail.com",
};

// English is the default: it is what the normal admin pages hold. Tamil and French texts are added on the Languages page.
export const languages = [
  { code: "en", name: "English", native_name: "English", is_default: true },
  { code: "ta", name: "Tamil", native_name: "தமிழ்", is_default: false },
  { code: "fr", name: "French", native_name: "Français", is_default: false },
];

// Music starts switched off until the client uploads a track in the admin panel
export const musicSettings = {
  enabled: false,
  volume: 40,
  autostart: true,
};

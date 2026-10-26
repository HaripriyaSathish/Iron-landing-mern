// Each statement is idempotent so `npm run db:init` is safe to re-run.
const schema = [
  `CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Single-row table (id is always 1)
  `CREATE TABLE IF NOT EXISTS navbar_settings (
    id TINYINT PRIMARY KEY DEFAULT 1,
    logo_url VARCHAR(500) NULL,
    logo_public_id VARCHAR(255) NULL,
    logo_alt VARCHAR(150) NOT NULL DEFAULT 'Iron Me Ka',
    cta_text VARCHAR(60) NOT NULL,
    cta_link VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT navbar_single_row CHECK (id = 1)
  )`,

  `CREATE TABLE IF NOT EXISTS nav_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(60) NOT NULL,
    target VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS quick_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('call', 'whatsapp', 'email') NOT NULL,
    label VARCHAR(60) NOT NULL,
    value VARCHAR(150) NOT NULL,
    message VARCHAR(255) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS hero_slides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tagline VARCHAR(80) NOT NULL,
    heading VARCHAR(150) NOT NULL,
    description VARCHAR(500) NOT NULL,
    image_url VARCHAR(500) NULL,
    image_public_id VARCHAR(255) NULL,
    image_alt VARCHAR(150) NULL,
    primary_btn_text VARCHAR(60) NULL,
    primary_btn_link VARCHAR(255) NULL,
    secondary_btn_text VARCHAR(60) NULL,
    secondary_btn_link VARCHAR(255) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Single-row table (id is always 1)
  `CREATE TABLE IF NOT EXISTS seo_settings (
    id TINYINT PRIMARY KEY DEFAULT 1,
    site_title VARCHAR(70) NOT NULL,
    meta_description VARCHAR(300) NOT NULL,
    meta_keywords VARCHAR(500) NULL,
    og_title VARCHAR(100) NULL,
    og_description VARCHAR(300) NULL,
    og_image_url VARCHAR(500) NULL,
    og_image_public_id VARCHAR(255) NULL,
    favicon_url VARCHAR(500) NULL,
    favicon_public_id VARCHAR(255) NULL,
    canonical_url VARCHAR(255) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT seo_single_row CHECK (id = 1)
  )`,

  // Single-row table (id is always 1)
  `CREATE TABLE IF NOT EXISTS about_section (
    id TINYINT PRIMARY KEY DEFAULT 1,
    tagline VARCHAR(80) NOT NULL,
    heading VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(500) NULL,
    image_public_id VARCHAR(255) NULL,
    image_alt VARCHAR(150) NULL,
    badge_value VARCHAR(20) NULL,
    badge_label VARCHAR(60) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT about_single_row CHECK (id = 1)
  )`,

  `CREATE TABLE IF NOT EXISTS about_highlights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    icon VARCHAR(40) NOT NULL,
    title VARCHAR(80) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Single-row table (id is always 1)
  `CREATE TABLE IF NOT EXISTS services_section (
    id TINYINT PRIMARY KEY DEFAULT 1,
    tagline VARCHAR(80) NOT NULL,
    heading VARCHAR(150) NOT NULL,
    subheading VARCHAR(300) NULL,
    price_label VARCHAR(30) NULL,
    btn_text VARCHAR(40) NULL,
    btn_link VARCHAR(255) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT services_single_row CHECK (id = 1)
  )`,

  `CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(300) NOT NULL,
    price INT UNSIGNED NULL,
    image_url VARCHAR(500) NULL,
    image_public_id VARCHAR(255) NULL,
    image_alt VARCHAR(150) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Single-row table (id is always 1)
  `CREATE TABLE IF NOT EXISTS why_section (
    id TINYINT PRIMARY KEY DEFAULT 1,
    tagline VARCHAR(80) NOT NULL,
    heading VARCHAR(150) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT why_single_row CHECK (id = 1)
  )`,

  `CREATE TABLE IF NOT EXISTS why_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    icon VARCHAR(40) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(300) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Single-row table (id is always 1)
  `CREATE TABLE IF NOT EXISTS how_section (
    id TINYINT PRIMARY KEY DEFAULT 1,
    tagline VARCHAR(80) NOT NULL,
    heading VARCHAR(150) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT how_single_row CHECK (id = 1)
  )`,

  `CREATE TABLE IF NOT EXISTS how_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    icon VARCHAR(40) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(300) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Single-row table (id is always 1)
  `CREATE TABLE IF NOT EXISTS testimonials_section (
    id TINYINT PRIMARY KEY DEFAULT 1,
    tagline VARCHAR(80) NOT NULL,
    heading VARCHAR(150) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT testimonials_single_row CHECK (id = 1)
  )`,

  `CREATE TABLE IF NOT EXISTS testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quote VARCHAR(500) NOT NULL,
    name VARCHAR(80) NOT NULL,
    role VARCHAR(80) NULL,
    rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT testimonial_rating CHECK (rating BETWEEN 1 AND 5)
  )`,

  // Single-row table (id is always 1). Book Today block + contact details.
  `CREATE TABLE IF NOT EXISTS contact_section (
    id TINYINT PRIMARY KEY DEFAULT 1,
    tagline VARCHAR(80) NOT NULL,
    heading VARCHAR(150) NOT NULL,
    description VARCHAR(500) NULL,
    primary_btn_text VARCHAR(40) NULL,
    secondary_btn_text VARCHAR(40) NULL,
    phone VARCHAR(30) NULL,
    whatsapp VARCHAR(255) NULL,
    whatsapp_message VARCHAR(255) NULL,
    email VARCHAR(150) NULL,
    address VARCHAR(300) NULL,
    map_url VARCHAR(500) NULL,
    business_hours VARCHAR(200) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT contact_single_row CHECK (id = 1)
  )`,

  // Single-row table (id is always 1). Logo, menu links, services and contact
  // details are reused from their own sections; only footer-specific text lives here.
  `CREATE TABLE IF NOT EXISTS footer_settings (
    id TINYINT PRIMARY KEY DEFAULT 1,
    about_text VARCHAR(400) NULL,
    links_title VARCHAR(60) NOT NULL,
    services_title VARCHAR(60) NOT NULL,
    services_limit TINYINT UNSIGNED NOT NULL DEFAULT 6,
    contact_title VARCHAR(60) NOT NULL,
    hours_short VARCHAR(100) NULL,
    copyright_text VARCHAR(200) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT footer_single_row CHECK (id = 1)
  )`,

  `CREATE TABLE IF NOT EXISTS social_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    platform VARCHAR(30) NOT NULL,
    url VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Single-row table (id is always 1). SMTP settings entered in the admin panel; password stored encrypted.
  `CREATE TABLE IF NOT EXISTS mail_settings (
    id TINYINT PRIMARY KEY DEFAULT 1,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    smtp_host VARCHAR(150) NULL,
    smtp_port INT NOT NULL DEFAULT 587,
    smtp_user VARCHAR(150) NULL,
    smtp_pass_enc TEXT NULL,
    from_email VARCHAR(150) NULL,
    from_name VARCHAR(80) NULL,
    alert_email VARCHAR(150) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT mail_single_row CHECK (id = 1)
  )`,

  // Single-row table (id is always 1). Background music file (Cloudinary) and how it plays.
  `CREATE TABLE IF NOT EXISTS music_settings (
    id TINYINT PRIMARY KEY DEFAULT 1,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    title VARCHAR(120) NULL,
    music_url VARCHAR(500) NULL,
    music_public_id VARCHAR(255) NULL,
    volume TINYINT UNSIGNED NOT NULL DEFAULT 40,
    autostart BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT music_single_row CHECK (id = 1)
  )`,

  // Website languages. The default one is the language typed into the normal admin pages.
  `CREATE TABLE IF NOT EXISTS languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(60) NOT NULL,
    native_name VARCHAR(60) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // One translated text per language + table row + column (entity_id 0 = fixed website labels).
  // A missing translation falls back to the default-language text.
  `CREATE TABLE IF NOT EXISTS translations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lang_code VARCHAR(10) NOT NULL,
    entity VARCHAR(40) NOT NULL,
    entity_id INT NOT NULL,
    field VARCHAR(40) NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT translation_unique UNIQUE (lang_code, entity, entity_id, field)
  )`,
];

// The DDL above is MySQL; Neon (Postgres) gets the same tables with these swaps.
export function toPostgresDDL(sql) {
  return sql
    .replace(/INT AUTO_INCREMENT PRIMARY KEY/g, "SERIAL PRIMARY KEY")
    .replace(/TINYINT UNSIGNED/g, "SMALLINT")
    .replace(/TINYINT/g, "SMALLINT")
    .replace(/INT UNSIGNED/g, "INTEGER")
    .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP/g, "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP")
    .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g, "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP")
    // type ENUM('a','b') → type VARCHAR(20) CHECK (type IN ('a','b'))
    .replace(/(\w+) ENUM\(([^)]*)\)/g, "$1 VARCHAR(20) CHECK ($1 IN ($2))");
}

export const schemaFor = (dialect) => (dialect === "postgres" ? schema.map(toPostgresDDL) : schema);

// Changes to tables that already exist (CREATE TABLE IF NOT EXISTS skips them). Each is safe to re-run.
const migrations = [
  // WhatsApp may be a Business link (https://wa.me/message/…), not just a number
  {
    mysql: "ALTER TABLE contact_section MODIFY whatsapp VARCHAR(255) NULL",
    postgres: "ALTER TABLE contact_section ALTER COLUMN whatsapp TYPE VARCHAR(255)",
  },
];

export const migrationsFor = (dialect) => migrations.map((m) => m[dialect === "postgres" ? "postgres" : "mysql"]);

export default schema;

import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { translations } from '../i18n/translations';

const socialLinks = [
  { icon: Github, href: 'https://github.com/c4m1r', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Mail, href: 'mailto:hello@example.com', label: 'Email' },
];

export function Footer() {
  const { language } = useApp();
  const t = translations[language].site;
  
  const footerLinks = [
    { href: '/site/about', label: t.nav.about },
    { href: '/site/blog', label: t.nav.blog },
    { href: '/site/wiki', label: t.nav.wiki },
    { href: '/site/gallery', label: t.nav.gallery },
  ];

  return (
    <footer className="relative mt-32">
      <div className="absolute inset-0 bg-gradient-to-t from-muted/50 to-transparent pointer-events-none" />

      <div className="relative container mx-auto px-6 py-16">
        <div className="glass rounded-3xl p-12">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold gradient-text mb-4">C4m1r.github.io</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t.footer.description}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">{t.footer.quickLinks}</h4>
              <ul className="space-y-2">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">{t.footer.connect}</h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neu-sm w-12 h-12 rounded-xl flex items-center justify-center bg-card hover:bg-primary/10 hover:text-primary transition-all"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
            <p>
              © 2025-{new Date().getFullYear()} C4m1r. {t.footer.madeWith}{' '}
              <a 
                href="https://github.com/7PixelRains/NervaWeb" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                NervaWeb
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

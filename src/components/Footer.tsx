import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

const socialLinks = [
  { icon: Github, href: 'https://github.com/c4m1r', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Mail, href: 'mailto:hello@example.com', label: 'Email' },
];

const footerLinks = [
  { href: '/site/about', label: 'About' },
  { href: '/site/blog', label: 'Blog' },
  { href: '/site/wiki', label: 'Wiki' },
  { href: '/site/gallery', label: 'Gallery' },
];

export function Footer() {
  return (
    <footer className="relative mt-32">
      <div className="absolute inset-0 bg-gradient-to-t from-muted/50 to-transparent pointer-events-none" />

      <div className="relative container mx-auto px-6 py-16">
        <div className="glass rounded-3xl p-12">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold gradient-text mb-4">C4m1r.github.io</h3>
              <p className="text-muted-foreground leading-relaxed">
                IT Engineer passionate about building beautiful, performant digital experiences.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
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
              <h4 className="font-semibold mb-4 text-foreground">Connect</h4>
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
            <p>© {new Date().getFullYear()} C4m1r. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

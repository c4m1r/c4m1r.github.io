import { useMemo, useState } from 'react';
import { useApp } from '../../contexts/useApp';
import { useNews } from '../../domain/news/useNews';
import { useArticles } from '../../domain/articles/useArticles';
import { markdownToHtml } from '../../domain/content/markdown';

interface MailMessage {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  body: string;
  originalPath?: string;
  unread?: boolean;
}

const folders = [
  { name: 'Inbox', active: true },
  { name: 'Drafts', count: 0 },
  { name: 'Outbox', count: 0 },
  { name: 'Sent Items', count: 0 },
  { name: 'Deleted Items', count: 0 },
];

const ADMIN = 'WebOS Admin <admin@c4m1r.github.io>';

function formatMailDate(value: string | undefined, language: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsed);
}

export function OutlookExpress() {
  const { theme, language } = useApp();
  const { news, loading: newsLoading } = useNews();
  const { articles, loading: articlesLoading } = useArticles();
  const isAppleMail = theme === 'macos-26' || theme.startsWith('ios-');

  const messages = useMemo<MailMessage[]>(() => {
    const welcome: MailMessage = {
      id: 'welcome',
      from: ADMIN,
      subject: language === 'ru' ? 'Добро пожаловать в NervaWEB WebOS' : 'Welcome to NervaWEB WebOS',
      preview:
        language === 'ru'
          ? 'Добро пожаловать в WebOS. Здесь будут появляться новости и записи блога.'
          : 'Welcome to WebOS. News and blog updates will appear here.',
      date: language === 'ru' ? 'Сегодня' : 'Today',
      body:
        language === 'ru'
          ? `# Добро пожаловать в NervaWEB WebOS

Это встроенный почтовый клиент WebOS.

Здесь автоматически появляются свежие новости и публикации блога с сайта. Содержимое писем берётся из тех же Markdown-источников, поэтому Mail и сайт не расходятся по контенту.

Автор системных рассылок: **admin@c4m1r.github.io**.`
          : `# Welcome to NervaWEB WebOS

This is the built-in WebOS mail client.

Fresh news and blog posts from the site appear here automatically. Messages use the same Markdown content sources as the website, so Mail and the site stay in sync.

System newsletter author: **admin@c4m1r.github.io**.`,
      originalPath: '/',
      unread: true,
    };

    const newsMessages: MailMessage[] = news.map((item) => ({
      id: `news:${item.id}`,
      from: ADMIN,
      subject: item.title,
      preview: item.content.replace(/[#>*_`\[\]()-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150),
      date: formatMailDate(item.date, language),
      body: item.content,
      originalPath: item.route?.sitePath ?? item.route?.path,
      unread: true,
    }));

    const blogMessages: MailMessage[] = articles.map((item) => ({
      id: `blog:${item.id}`,
      from: ADMIN,
      subject: item.title,
      preview:
        item.summary ||
        item.content.replace(/[#>*_`\[\]()-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150),
      date: formatMailDate(item.updatedAt || item.date, language),
      body: item.content,
      originalPath: item.articlePath ?? item.route?.sitePath ?? item.route?.path,
      unread: false,
    }));

    return [welcome, ...newsMessages, ...blogMessages];
  }, [articles, language, news]);

  const [activeMessageId, setActiveMessageId] = useState('welcome');
  const activeMessage = messages.find((message) => message.id === activeMessageId) ?? messages[0];
  const isLoading = newsLoading || articlesLoading;

  const inboxCount = messages.length;

  return (
    <div className="mail-app flex h-full w-full bg-[#f3f3f3] text-xs font-tahoma text-[#1f1f1f] select-none">
      <aside className="mail-app__sidebar w-48 bg-[#d7e4f7] border-r border-[#9cb2cf] flex flex-col">
        <header className="px-3 py-2 border-b border-[#9cb2cf] bg-gradient-to-r from-[#1b4fa3] to-[#3c73d8] text-white text-[12px] font-semibold">
          {isAppleMail ? 'Mailboxes' : 'Mail'}
        </header>
        <div className="flex-1 overflow-auto py-2">
          <div className="px-3 pb-2 text-[11px] text-[#1b4fa3] font-semibold uppercase">
            NervaWEB WebOS
          </div>
          <ul className="flex flex-col">
            {folders.map((folder) => {
              const count = folder.name === 'Inbox' ? inboxCount : folder.count;
              return (
                <li
                  key={folder.name}
                  className={`px-3 py-1 flex items-center justify-between ${
                    folder.active
                      ? 'bg-[#1b4fa3] text-white font-semibold'
                      : 'hover:bg-[#e6efff] text-[#1b4fa3]'
                  }`}
                >
                  <span>{folder.name}</span>
                  {count !== undefined && (
                    <span
                      className={`px-1 text-[10px] rounded ${
                        folder.active ? 'bg-[#335fa3]' : 'bg-white text-[#1b4fa3]'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <main className="mail-app__main flex-1 flex flex-col min-w-0">
        <header className="mail-app__toolbar flex items-center justify-between px-3 py-2 bg-gradient-to-r from-white to-[#e9f1ff] border-b border-[#c2d3e8] text-[11px] text-[#1b4fa3]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold">Inbox</span>
            <span className="truncate">(NervaWEB WebOS)</span>
          </div>
          <div className="flex items-center gap-2 text-[#0f3469]">
            <button className="px-2 py-1 bg-white border border-[#9cb2cf] rounded hover:bg-[#dfe9ff]">
              New Mail
            </button>
            <button className="px-2 py-1 bg-white border border-[#9cb2cf] rounded hover:bg-[#dfe9ff]">
              Reply
            </button>
            <button className="px-2 py-1 bg-white border border-[#9cb2cf] rounded hover:bg-[#dfe9ff]">
              Forward
            </button>
          </div>
        </header>

        <section className="mail-app__columns border-b border-[#c2d3e8] bg-white flex items-center px-3 py-1 text-[11px] text-[#1b4fa3] uppercase tracking-wide">
          <span className="w-6">!</span>
          <span className="flex-1">From</span>
          <span className="flex-1">Subject</span>
          <span className="w-28 text-right">Received</span>
        </section>

        <section className="mail-app__message-list bg-white border-b border-[#c2d3e8] h-44 overflow-auto">
          {isLoading && messages.length <= 1 && (
            <div className="px-3 py-3 text-[11px] opacity-60">Loading WebOS updates…</div>
          )}

          {messages.map((message) => (
            <article
              key={message.id}
              className={`mail-app__message flex items-center px-3 py-2 text-[11px] border-b border-[#edf3ff] ${
                message.id === activeMessage?.id ? 'is-active bg-[#dfe9ff]' : 'hover:bg-[#f6f9ff]'
              }`}
              onClick={() => setActiveMessageId(message.id)}
            >
              <span className="w-6 text-[#1b4fa3]">{message.unread ? '•' : ''}</span>
              <span className="flex-1 font-semibold truncate">{message.from}</span>
              <span className="flex-1 text-[#305ca8] truncate">{message.subject}</span>
              <span className="w-28 text-right text-[#305ca8] truncate">{message.date}</span>
            </article>
          ))}
        </section>

        {activeMessage && (
          <section className="mail-app__reader flex-1 bg-white px-4 py-3 overflow-auto text-[11px] leading-5 text-[#1f1f1f]">
            <header className="border-b border-[#c2d3e8] pb-2 mb-3">
              <div className="flex items-center gap-2 text-[#1b4fa3]">
                <span className="font-semibold uppercase">From:</span>
                <span>{activeMessage.from}</span>
              </div>
              <div className="flex items-center gap-2 text-[#1b4fa3]">
                <span className="font-semibold uppercase">Subject:</span>
                <span>{activeMessage.subject}</span>
              </div>
              <div className="flex items-center gap-2 text-[#1b4fa3]">
                <span className="font-semibold uppercase">Sent:</span>
                <span>{activeMessage.date}</span>
              </div>
            </header>

            <article
              className="mail-app__body markdown-body"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(activeMessage.body) }}
            />

            {activeMessage.originalPath && (
              <div className="mail-app__original-link-wrap">
                <a
                  className="mail-app__original-link"
                  href={activeMessage.originalPath}
                >
                  {language === 'ru' ? 'Открыть оригинал на сайте' : 'Open original on site'}
                </a>
              </div>
            )}
          </section>
        )}

        <footer className="mail-app__status px-3 py-2 bg-[#d7e4f7] border-t border-[#9cb2cf] text-[10px] text-[#1b4fa3] flex items-center justify-between">
          <span>{inboxCount} messages</span>
          <span>{isLoading ? 'Checking updates…' : 'Content synced with site'}</span>
        </footer>
      </main>
    </div>
  );
}

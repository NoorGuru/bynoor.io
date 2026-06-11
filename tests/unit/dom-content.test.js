import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

let document;

beforeAll(() => {
  const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf-8');
  const dom = new JSDOM(html);
  document = dom.window.document;
});

describe('Hero Section', () => {
  it('has a profile image with descriptive alt text', () => {
    const img = document.querySelector('#hero img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('alt')).toContain('Mohammad Noor Abu Khlaif');
  });

  it('has an h1 with the correct name', () => {
    const h1 = document.querySelector('#hero h1');
    expect(h1).not.toBeNull();
    expect(h1.textContent).toBe('Mohammad Noor');
  });

  it('has the tagline text', () => {
    const tagline = document.querySelector('.hero__tagline');
    expect(tagline).not.toBeNull();
    expect(tagline.textContent).toBe('I build tools that help engineers move faster.');
  });

  it('has the subtitle text', () => {
    const subtitle = document.querySelector('.hero__role');
    expect(subtitle).not.toBeNull();
    expect(subtitle.textContent).toBe('Software Engineer · AI Advocate · Tech Educator');
  });

  it('has a "Let\'s Connect" CTA linking to cal.com', () => {
    const cta = document.querySelector('#hero a[href="https://cal.com/mohammad-noor"]');
    expect(cta).not.toBeNull();
    expect(cta.textContent).toContain("Let's Connect");
  });

  it('has social icon links with correct hrefs in hero', () => {
    const heroSection = document.querySelector('#hero');
    const linkedin = heroSection.querySelector('a[href="https://go.bynoor.io/linkedin"]');
    const github = heroSection.querySelector('a[href="https://go.bynoor.io/github"]');
    const youtube = heroSection.querySelector('a[href="https://go.bynoor.io/youtube"]');
    const email = heroSection.querySelector('a[href="https://go.bynoor.io/email"]');

    expect(linkedin).not.toBeNull();
    expect(github).not.toBeNull();
    expect(youtube).not.toBeNull();
    expect(email).not.toBeNull();
  });
});

describe('Highlights Section', () => {
  it('contains all 5 highlight cards with correct titles', () => {
    const titles = document.querySelectorAll('#highlights .highlights__title');
    expect(titles.length).toBe(5);

    const expectedTitles = [
      'AI Platform Builder',
      'AI Pioneer & Champion',
      'Teaching Since 2012',
      '9+ Years in Production',
      'Engineering Leader',
    ];

    const actualTitles = Array.from(titles).map((t) => t.textContent);
    expectedTitles.forEach((title) => {
      expect(actualTitles).toContain(title);
    });
  });
});

describe('Skills Section', () => {
  it('has all 4 skill categories', () => {
    const categories = document.querySelectorAll('#skills .skills__category-name');
    expect(categories.length).toBe(4);

    const expectedCategories = ['Languages', 'Technologies', 'Areas of Expertise', 'Leadership'];
    const actualCategories = Array.from(categories).map((c) => c.textContent);
    expectedCategories.forEach((cat) => {
      expect(actualCategories).toContain(cat);
    });
  });

  it('has all skills present', () => {
    const pills = document.querySelectorAll('#skills .skill-pill');
    const allSkills = Array.from(pills).map((p) => p.textContent);

    const expectedSkills = [
      'Kotlin', 'Java', 'Python', 'TypeScript', 'JavaScript', 'Scala',
      'Spring Boot', 'GraphQL', 'gRPC', 'AWS', 'React', 'NodeJS', 'OpenAPI',
      'SDKs', 'Platform Engineering', 'AI-native Architectures', 'MCP', 'Agent Frameworks', 'Microservices', 'Backend', 'Full-Stack',
      'Engineering Leadership', 'Mentoring', 'Hiring', 'Coaching', 'Training', 'AI Advocacy',
    ];

    expectedSkills.forEach((skill) => {
      expect(allSkills).toContain(skill);
    });
  });
});

describe('Links Section', () => {
  const expectedLinkCardHrefs = [
    'https://go.bynoor.io/github',
    'https://go.bynoor.io/youtube',
    'https://go.bynoor.io/twitter',
    'https://go.bynoor.io/sof',
    'https://go.bynoor.io/hr',
  ];

  const expectedBannerLinkHrefs = [
    'https://go.bynoor.io/linkedin',
    'https://go.bynoor.io/email',
  ];

  it('has all social link cards and banner links with correct hrefs', () => {
    const linksSection = document.querySelector('#links');
    expectedLinkCardHrefs.forEach((href) => {
      const link = linksSection.querySelector(`a.link-card[href="${href}"]`);
      expect(link, `Expected link-card with href="${href}"`).not.toBeNull();
    });
    expectedBannerLinkHrefs.forEach((href) => {
      const link = linksSection.querySelector(`a[href="${href}"]`);
      expect(link, `Expected banner link with href="${href}"`).not.toBeNull();
    });
  });

  it('has "Let\'s Connect" button with correct href', () => {
    const linksSection = document.querySelector('#links');
    const cta = linksSection.querySelector('a[href="https://cal.com/mohammad-noor"]');
    expect(cta).not.toBeNull();
    expect(cta.textContent).toContain("Let's Connect");
  });

  it('all links have target="_blank" and rel="noopener"', () => {
    const linksSection = document.querySelector('#links');
    const allLinks = linksSection.querySelectorAll('a[href^="https://"]');
    allLinks.forEach((link) => {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    });
  });

  it('YouTube link has "Code with Noor" label', () => {
    const linksSection = document.querySelector('#links');
    const youtubeLink = linksSection.querySelector('a[href="https://go.bynoor.io/youtube"]');
    expect(youtubeLink).not.toBeNull();
    const label = youtubeLink.querySelector('.link-card__label');
    expect(label.textContent).toBe('Code with Noor');
  });
});

describe('Projects Section', () => {
  it('has 2 project cards with correct URLs', () => {
    const projectCards = document.querySelectorAll('#projects .project-card');
    expect(projectCards.length).toBe(2);

    const areej = document.querySelector('#projects a[href="https://areej.io/"]');
    const hireFound = document.querySelector('#projects a[href="https://mohnoor94.github.io/hire-found/"]');

    expect(areej).not.toBeNull();
    expect(hireFound).not.toBeNull();
  });

  it('project cards open in new tabs', () => {
    const projectCards = document.querySelectorAll('#projects .project-card');
    projectCards.forEach((card) => {
      expect(card.getAttribute('target')).toBe('_blank');
      expect(card.getAttribute('rel')).toContain('noopener');
    });
  });
});

describe('Navigation', () => {
  it('has all section links present', () => {
    const nav = document.querySelector('nav');
    const links = nav.querySelectorAll('a');
    const hrefs = Array.from(links).map((l) => l.getAttribute('href'));

    expect(hrefs).toContain('#highlights');
    expect(hrefs).toContain('#skills');
    expect(hrefs).toContain('#links');
    expect(hrefs).toContain('#projects');
  });

  it('has Resources link present', () => {
    const nav = document.querySelector('nav');
    const resourcesLink = nav.querySelector('a[href="/technical-interview-preparation-kit/"]');
    expect(resourcesLink).not.toBeNull();
    expect(resourcesLink.textContent).toBe('Resources');
  });
});

describe('Footer', () => {
  it('has footer with branding and year placeholder', () => {
    const footer = document.querySelector('footer.footer');
    expect(footer).not.toBeNull();
    expect(footer.textContent).toContain('noor');
    // The year is filled by JS at runtime; check the span exists
    const yearSpan = footer.querySelector('#year');
    expect(yearSpan).not.toBeNull();
  });
});

describe('SEO', () => {
  it('has Open Graph tags present', () => {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');

    expect(ogTitle).not.toBeNull();
    expect(ogDesc).not.toBeNull();
    expect(ogImage).not.toBeNull();
    expect(ogUrl).not.toBeNull();
  });

  it('has valid JSON-LD Person schema', () => {
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const schema = JSON.parse(script.textContent);
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Person');
    expect(schema.name).toBe('Mohammad Noor Abu Khlaif');
    expect(schema.url).toBeDefined();
    expect(schema.jobTitle).toBeDefined();
    expect(schema.sameAs).toBeInstanceOf(Array);
    expect(schema.sameAs.length).toBeGreaterThan(0);
  });

  it('title is ≤ 60 characters', () => {
    const title = document.querySelector('title');
    expect(title).not.toBeNull();
    expect(title.textContent.length).toBeLessThanOrEqual(60);
  });

  it('meta description is between 50 and 160 characters', () => {
    const desc = document.querySelector('meta[name="description"]');
    expect(desc).not.toBeNull();
    const content = desc.getAttribute('content');
    expect(content.length).toBeGreaterThanOrEqual(50);
    expect(content.length).toBeLessThanOrEqual(160);
  });
});

describe('Accessibility', () => {
  it('skip-nav link is the first focusable element', () => {
    const allFocusable = document.querySelectorAll(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = allFocusable[0];
    expect(first).not.toBeNull();
    expect(first.classList.contains('skip-nav')).toBe(true);
    expect(first.getAttribute('href')).toBe('#main-content');
  });

  it('semantic landmarks are present', () => {
    expect(document.querySelector('header')).not.toBeNull();
    expect(document.querySelector('nav')).not.toBeNull();
    expect(document.querySelector('main')).not.toBeNull();
    expect(document.querySelector('footer')).not.toBeNull();
  });

  it('icon links have ARIA labels', () => {
    const heroSocial = document.querySelectorAll('#hero .hero__social-link, #hero .hero__social-links a');
    heroSocial.forEach((link) => {
      expect(link.getAttribute('aria-label')).toBeTruthy();
    });

    const linkCards = document.querySelectorAll('#links .link-card');
    linkCards.forEach((link) => {
      expect(link.getAttribute('aria-label')).toBeTruthy();
    });
  });
});

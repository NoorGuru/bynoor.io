import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { JSDOM } from 'jsdom';

let document;

beforeAll(() => {
  // Pages are rendered by Astro: assert against the built output.
  // Run `npm run build` before executing these tests.
  const html = readFileSync(resolve(__dirname, '../../dist/index.html'), 'utf-8');
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
    expect(h1.textContent).toContain('Mohammad');
    expect(h1.textContent).toContain('Noor');
  });

  it('has the tagline text', () => {
    const tagline = document.querySelector('.hero__tagline');
    expect(tagline).not.toBeNull();
    expect(tagline.textContent).toContain('I build tools that help engineers move faster');
  });

  it('has the subtitle text', () => {
    // In the redesigned hero, the subtitle/role info lives in the terminal output
    const heroSection = document.querySelector('#hero');
    expect(heroSection.textContent).toContain('Software Engineer');
  });

  it('has a "Let\'s Connect" CTA linking to cal.com', () => {
    const cta = document.querySelector('#hero a[href="https://cal.com/mohammad-noor"]');
    expect(cta).not.toBeNull();
    expect(cta.textContent).toContain("Let's Connect");
  });

  it('has social icon links with correct hrefs in hero', () => {
    const heroSection = document.querySelector('#hero');
    const linkedin = heroSection.querySelector('a[href="https://www.linkedin.com/in/mohnoor94"]');
    const github = heroSection.querySelector('a[href="https://github.com/mohnoor94"]');
    const youtube = heroSection.querySelector('a[href="https://www.youtube.com/c/CodeWithNoor"]');
    const email = heroSection.querySelector('a[href="mailto:moh.noor94@gmail.com"]');

    expect(linkedin).not.toBeNull();
    expect(github).not.toBeNull();
    expect(youtube).not.toBeNull();
    expect(email).not.toBeNull();
  });
});

describe('Highlights Section', () => {
  it('renders the proof ledger with a figure and description per row', () => {
    const rows = document.querySelectorAll('#highlights .ledger__row');
    expect(rows.length).toBe(11);

    rows.forEach((row) => {
      expect(row.querySelector('.ledger__figure')).not.toBeNull();
      expect(row.querySelector('.ledger__desc')).not.toBeNull();
    });

    const figures = Array.from(rows).map((r) => r.querySelector('.ledger__figure').textContent);
    ['weeks → hours', '1st', '13 years', '100s', 'MIT'].forEach((figure) => {
      expect(figures).toContain(figure);
    });
  });
});

describe('Skills Section', () => {
  it('has all 3 skill layers', () => {
    const labels = document.querySelectorAll('#skills .skills__layer-label');
    expect(labels.length).toBe(3);

    const expectedLabels = ['build', 'architect', 'lead'];
    const actualLabels = Array.from(labels).map((l) => l.textContent);
    expectedLabels.forEach((label) => {
      expect(actualLabels).toContain(label);
    });
  });

  it('has all skill tokens present', () => {
    const tokens = document.querySelectorAll('#skills .skills__token');
    const allSkills = Array.from(tokens).map((t) => t.textContent);

    const expectedSkills = [
      'Kotlin', 'Java', 'Python', 'TypeScript', 'JavaScript', 'Scala',
      'Spring Boot', 'GraphQL', 'gRPC', 'AWS', 'React', 'Node.js', 'OpenAPI',
      'SDKs', 'Platform Engineering', 'AI-native Architectures', 'MCP Servers', 'Agent Frameworks', 'Microservices', 'Backend', 'Full-Stack',
      'Engineering Leadership', 'Mentoring & Coaching', 'Hiring & Bar Raising', 'AI Advocacy',
    ];

    expectedSkills.forEach((skill) => {
      expect(allSkills).toContain(skill);
    });
  });
});

describe('Links Section', () => {
  const expectedChannelHrefs = [
    'https://www.youtube.com/c/CodeWithNoor',
    'https://www.linkedin.com/in/mohnoor94',
    'https://github.com/mohnoor94',
    'https://x.com/mohnoor94',
  ];

  const expectedAnchorLinkHrefs = [
    'mailto:moh.noor94@gmail.com',
  ];

  it('has all world cards and anchor links with correct hrefs', () => {
    const linksSection = document.querySelector('#links');
    expectedChannelHrefs.forEach((href) => {
      const link = linksSection.querySelector(`a.links__world[href="${href}"]`);
      expect(link, `Expected world card with href="${href}"`).not.toBeNull();
    });
    expectedAnchorLinkHrefs.forEach((href) => {
      const link = linksSection.querySelector(`a[href="${href}"]`);
      expect(link, `Expected anchor link with href="${href}"`).not.toBeNull();
    });
  });

  it('has "Book a conversation" button with correct href', () => {
    const linksSection = document.querySelector('#links');
    const cta = linksSection.querySelector('a.links__cta[href="https://cal.com/mohammad-noor"]');
    expect(cta).not.toBeNull();
    expect(cta.textContent).toContain('Book a conversation');
  });

  it('all links have target="_blank" and rel="noopener"', () => {
    const linksSection = document.querySelector('#links');
    const allLinks = linksSection.querySelectorAll('a[href^="https://"]');
    allLinks.forEach((link) => {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    });
  });

  it('YouTube world has "Code with Noor" label', () => {
    const linksSection = document.querySelector('#links');
    const youtubeLink = linksSection.querySelector('a[href="https://www.youtube.com/c/CodeWithNoor"]');
    expect(youtubeLink).not.toBeNull();
    const label = youtubeLink.querySelector('.links__world-platform');
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

  it('has Nebula featured project with correct live URL and repo', () => {
    const nebulaLive = document.querySelector('#projects a[href="https://nebula.bynoor.io"]');
    expect(nebulaLive).not.toBeNull();
    expect(nebulaLive.getAttribute('target')).toBe('_blank');
    expect(nebulaLive.getAttribute('rel')).toContain('noopener');

    const nebulaRepo = document.querySelector('#projects a[href="https://github.com/NoorGuru/nebula"]');
    expect(nebulaRepo).not.toBeNull();
    expect(nebulaRepo.getAttribute('target')).toBe('_blank');
    expect(nebulaRepo.getAttribute('rel')).toContain('noopener');
  });

  it('has Aura featured project with correct live URL and repo', () => {
    const auraLive = document.querySelector('#projects a[href="https://aura.bynoor.io"]');
    expect(auraLive).not.toBeNull();
    expect(auraLive.getAttribute('target')).toBe('_blank');
    expect(auraLive.getAttribute('rel')).toContain('noopener');

    const auraRepo = document.querySelector('#projects a[href="https://github.com/NoorGuru/irec"]');
    expect(auraRepo).not.toBeNull();
    expect(auraRepo.getAttribute('target')).toBe('_blank');
    expect(auraRepo.getAttribute('rel')).toContain('noopener');
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

  it('has prep kit link present', () => {
    const nav = document.querySelector('nav');
    const kitLink = nav.querySelector('a[href="/technical-interview-preparation-kit/"]');
    expect(kitLink).not.toBeNull();
    expect(kitLink.textContent.toLowerCase()).toBe('prep kit');
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
    // jsdom parses <noscript> content as focusable, but real browsers with JS
    // enabled never render it — exclude it to test what keyboard users get.
    const allFocusable = Array.from(
      document.querySelectorAll('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.closest('noscript'));
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

    const worldCards = document.querySelectorAll('#links .links__world');
    expect(worldCards.length).toBeGreaterThan(0);
    worldCards.forEach((link) => {
      expect(link.getAttribute('aria-label')).toBeTruthy();
    });
  });
});

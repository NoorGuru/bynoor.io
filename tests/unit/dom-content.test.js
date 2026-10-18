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

  it('has a "Book a conversation" CTA linking to cal.com', () => {
    const cta = document.querySelector('#hero a[href="https://cal.com/mohammad-noor"]');
    expect(cta).not.toBeNull();
    expect(cta.textContent).toContain("Book a conversation");
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

  it('has the editorial portrait frame with photo', () => {
    const frame = document.querySelector('#hero .hero__portrait-frame');
    expect(frame).not.toBeNull();
    const img = frame.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('/profile-pic.png');
  });

  it('renders the core capabilities plaque ledger', () => {
    const ledger = document.querySelector('#hero .hero__plaque-ledger');
    expect(ledger).not.toBeNull();
    expect(ledger.textContent).toContain('Builder');
    expect(ledger.textContent).toContain('Teacher');
    expect(ledger.textContent).toContain('Engineer');
  });

  it('has typography brass accent on engineers move faster', () => {
    const brass = document.querySelector('#hero .hero__title .u-brass');
    expect(brass).not.toBeNull();
    expect(brass.textContent).toBe('engineers move faster');
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
  const expectedSkills = [
    'Kotlin',
    'Java',
    'Python',
    'TypeScript',
    'JavaScript',
    'Scala',
    'Spring Boot',
    'GraphQL',
    'gRPC',
    'React',
    'Node.js',
    'AWS',
    'gcloud / GCP',
    'OpenAPI',
    'Platform Engineering',
    'AI-native Architectures',
    'MCP Servers',
    'Agent Frameworks',
    'LLM Tooling',
    'SDKs',
    'Microservices',
    'Distributed Systems',
    'System Design',
    'Backend',
    'Full-Stack',
    'Engineering Leadership',
    'Mentoring & Coaching',
    'Hiring & Bar Raising',
    'AI Advocacy',
    'Training at Scale',
    'Product Thinking',
    'Strategic Planning',
    'Knowledge Sharing',
    'Cross-Team Influence',
  ];

  const expectedProofs = [
    'Learned React in weeks to lead an Amazon frontend project. Work daily across Kotlin, Java, Python, and TypeScript on backend, frontend, and infrastructure.',
    'SDK platform handling 500M+ requests/year. Chain-of-tools agent architecture that cuts hallucination. Systems I built at Amazon still running 3+ years after I left.',
    'Trained hundreds on AI-powered development. Onboarded 6 engineers onto 50+ repositories. Hired tens of engineers through bar-raising interviews at Amazon and Expedia. Teaching programming since 2013.',
  ];

  it('has 3 chapter names build, architect, lead in order', () => {
    const chapterNames = Array.from(
      document.querySelectorAll('#skills .skills__chapter-name')
    ).map((el) => el.textContent.trim());
    expect(chapterNames).toEqual(['build', 'architect', 'lead']);
  });

  it('has exactly 34 skills entries in order, correct per-chapter counts, and no element children', () => {
    const entries = Array.from(
      document.querySelectorAll('#skills .skills__entry')
    );
    expect(entries.length).toBe(34);
    expect(entries.map((el) => el.textContent.trim())).toEqual(expectedSkills);

    const chapters = Array.from(
      document.querySelectorAll('#skills .skills__chapter')
    );
    expect(chapters.length).toBe(3);
    const perChapterCounts = chapters.map(
      (ch) => ch.querySelectorAll('.skills__entry').length
    );
    expect(perChapterCounts).toEqual([14, 11, 9]);

    entries.forEach((entry) => {
      expect(entry.children.length).toBe(0);
    });
  });

  it('contains exactly the 41 allowlisted strings in DOM order with zero invented copy', () => {
    const expected41Strings = [
      'How I Work',
      'build',
      expectedProofs[0],
      ...expectedSkills.slice(0, 14),
      'architect',
      expectedProofs[1],
      ...expectedSkills.slice(14, 25),
      'lead',
      expectedProofs[2],
      ...expectedSkills.slice(25, 34),
    ];
    expect(expected41Strings.length).toBe(41);

    const actualStrings = Array.from(
      document.querySelectorAll('#skills h2, #skills h3, #skills p, #skills li')
    ).map((el) => el.textContent.trim());

    expect(actualStrings).toEqual(expected41Strings);
  });

  it('has negative checks: no rejected classes or text fragments anywhere in #skills', () => {
    const rejectedSelectors = [
      '#skills .skills__cap',
      '#skills .skills__tag',
      '#skills .skills__core',
      '#skills [class*="skills__index"]',
      '#skills [class*="skills__connector"]',
      '#skills [class*="skills__layer"]',
      '#skills .skills__meta',
      '#skills .skills__stack',
      '#skills .skills__feeds',
    ];

    rejectedSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      expect(elements.length, `Expected no elements for ${selector}`).toBe(0);
    });

    const sectionText = document.querySelector('#skills').textContent;
    expect(sectionText).not.toContain('feeds');
    expect(sectionText).not.toContain('Also in this layer');
  });

  it('preserves all proof sentences verbatim', () => {
    const proofs = Array.from(
      document.querySelectorAll('#skills .skills__chapter-proof')
    ).map((el) => el.textContent.trim());
    expect(proofs).toEqual(expectedProofs);
  });

  it('has zero interactive, focusable, or data-animate elements inside #skills', () => {
    const forbidden = document.querySelectorAll(
      '#skills a, #skills button, #skills [tabindex], #skills [data-animate]'
    );
    expect(forbidden.length).toBe(0);
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

  it('featured project browser chrome has https URL pill, green status dot with LIVE · PRODUCTION, and window controls', () => {
    const auraUrl = document.querySelector('.projects__featured--aura .projects__browser-url');
    const nebulaUrl = document.querySelector('.projects__featured--nebula .projects__browser-url');
    expect(auraUrl.textContent).toContain('https://aura.bynoor.io');
    expect(nebulaUrl.textContent).toContain('https://nebula.bynoor.io');

    const statusBadges = document.querySelectorAll('#projects .projects__browser-status');
    expect(statusBadges.length).toBeGreaterThanOrEqual(2);
    statusBadges.forEach((badge) => {
      expect(badge.querySelector('.projects__browser-status-dot')).not.toBeNull();
      expect(badge.querySelector('.projects__browser-status-text').textContent).toContain('LIVE · PRODUCTION');
    });

    const windowControls = document.querySelectorAll('#projects .projects__browser-dots');
    expect(windowControls.length).toBeGreaterThanOrEqual(2);
    windowControls.forEach((dots) => {
      expect(dots.querySelector('.projects__browser-dot--close')).not.toBeNull();
      expect(dots.querySelector('.projects__browser-dot--min')).not.toBeNull();
      expect(dots.querySelector('.projects__browser-dot--expand')).not.toBeNull();
    });
  });

  it('has EG Wizard flagship card with authentic evolution arc and verified metrics', () => {
    const egWizard = document.querySelector('.projects__featured--egwizard');
    expect(egWizard).not.toBeNull();

    const title = egWizard.querySelector('.projects__featured-title');
    expect(title.textContent).toBe('EG Wizard');

    const arc = egWizard.querySelector('.projects__featured-arc');
    expect(arc.textContent).toContain('v1');
    expect(arc.textContent).toContain('Copilot Extension');
    expect(arc.textContent).toContain('v4');
    expect(arc.textContent).toContain('MCP + Skills');

    const stats = egWizard.querySelectorAll('.projects__stat');
    expect(stats.length).toBe(3);
    const statsText = egWizard.querySelector('.projects__featured-stats').textContent;
    expect(statsText).toContain('Weeks → Hours');
    expect(statsText).toContain('Migration Velocity');
    expect(statsText).toContain('4 Versions');
    expect(statsText).toContain('in 6 Months');
    expect(statsText).toContain('3-Year');
    expect(statsText).toContain('Official Roadmap');
  });

  it('has alternating featured case study cards (Aura, Nebula, EG Wizard)', () => {
    const aura = document.querySelector('.projects__featured--aura');
    const nebula = document.querySelector('.projects__featured--nebula');
    const egWizard = document.querySelector('.projects__featured--egwizard');

    expect(aura).not.toBeNull();
    expect(nebula).not.toBeNull();
    expect(egWizard).not.toBeNull();

    // Check DOM order: Aura -> Nebula -> EG Wizard
    const featuredArticles = document.querySelectorAll('#projects .projects__featured');
    expect(featuredArticles[0]).toBe(aura);
    expect(featuredArticles[1]).toBe(nebula);
    expect(featuredArticles[2]).toBe(egWizard);
  });
});

describe('Navigation', () => {
  it('has all section links present including journey', () => {
    const nav = document.querySelector('nav');
    const links = nav.querySelectorAll('a');
    const hrefs = Array.from(links).map((l) => l.getAttribute('href'));

    expect(hrefs).toContain('#highlights');
    expect(hrefs).toContain('#skills');
    expect(hrefs).toContain('#links');
    expect(hrefs).toContain('#projects');
    expect(hrefs).toContain('#journey');
  });

  it('renders desktop navigation links in correct order with journey after build', () => {
    const navLinks = Array.from(document.querySelectorAll('.nav__links .nav__link'));
    const items = navLinks.map((l) => ({
      href: l.getAttribute('href'),
      text: l.textContent.trim().toLowerCase(),
    }));

    expect(items).toEqual([
      { href: '#highlights', text: 'proof' },
      { href: '#projects', text: 'build' },
      { href: '#journey', text: 'journey' },
      { href: '#teach', text: 'teach' },
      { href: '#skills', text: 'skills' },
      { href: '#links', text: 'connect' },
      { href: '/technical-interview-preparation-kit/', text: 'prep kit' },
    ]);
  });

  it('renders mobile menu links with 01..07 indices in order including journey', () => {
    const mobileLinks = Array.from(document.querySelectorAll('.mobile-menu__link'));
    const items = mobileLinks.map((l) => {
      const index = l.querySelector('.mobile-menu__link-index')?.textContent.trim();
      const text = l.textContent.replace(index || '', '').trim().toLowerCase();
      return {
        index,
        text,
        href: l.getAttribute('href'),
      };
    });

    expect(items).toEqual([
      { index: '01', text: 'proof', href: '#highlights' },
      { index: '02', text: 'build', href: '#projects' },
      { index: '03', text: 'journey', href: '#journey' },
      { index: '04', text: 'teach', href: '#teach' },
      { index: '05', text: 'skills', href: '#skills' },
      { index: '06', text: 'connect', href: '#links' },
      { index: '07', text: 'prep kit', href: '/technical-interview-preparation-kit/' },
    ]);
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

describe('Journey Section', () => {
  it('renders 3 acts and 1 throughline in order', () => {
    const acts = document.querySelectorAll('#journey .journey__act');
    expect(acts.length).toBe(3);

    const companies = Array.from(
      document.querySelectorAll('#journey .journey__company')
    ).map((el) => el.textContent.trim());

    expect(companies).toEqual([
      'Expedia Group',
      'Amazon',
      'Wiley (Atypon)',
      'Code with Noor',
    ]);
  });

  it('has exactly one featured entry and it is the Edge & API Platform role', () => {
    const featured = document.querySelectorAll(
      '#journey .journey__entry--featured'
    );
    expect(featured.length).toBe(1);

    const title = featured[0].querySelector('.journey__role-title');
    expect(title).not.toBeNull();
    expect(title.textContent.trim()).toBe('SDE III, Edge & API Platform');

    const eyebrow = featured[0].querySelector('.journey__role-eyebrow');
    expect(eyebrow).not.toBeNull();
    expect(eyebrow.textContent.trim()).toBe('Current Role');
  });

  it('preserves all role titles and periods verbatim', () => {
    const roleTitles = Array.from(
      document.querySelectorAll(
        '#journey .journey__role-title, #journey .journey__index-title'
      )
    ).map((el) => el.textContent.trim());

    expect(roleTitles).toEqual([
      'SDE III, Edge & API Platform',
      'SDE III, Partner Developer Experience',
      'SDE III, InsurTech',
      'Software Development Engineer',
      'Software Engineer, Mid Level',
      'Software Engineer',
    ]);

    const rolePeriods = Array.from(
      document.querySelectorAll('#journey .journey__role-period')
    ).map((el) => el.textContent.trim());

    expect(rolePeriods).toEqual([
      'Jul 2025 – Present',
      'Jul 2022 – Jun 2025',
      'Dec 2021 – Jul 2022',
    ]);

    const employerPeriods = Array.from(
      document.querySelectorAll('#journey .journey__chapter-meta .journey__period')
    ).map((el) => el.textContent.trim());

    expect(employerPeriods).toEqual([
      'Dec 2021 – Present',
      'Sep 2019 – Dec 2021',
      'Feb 2017 – Sep 2019',
      'Feb 2013 – Present',
    ]);

    const durations = Array.from(
      document.querySelectorAll('#journey .journey__duration')
    ).map((el) => el.textContent.trim());

    expect(durations).toEqual(['2 years 4 months', '2 years 8 months']);
  });

  it('preserves all descriptions and highlights verbatim', () => {
    const expediaDescs = Array.from(
      document.querySelectorAll(
        '#journey [data-company="expedia"] .journey__role-desc'
      )
    ).map((el) => el.textContent.trim());

    expect(expediaDescs).toEqual([
      "Architecting AI-powered infrastructure and core platforms. Invented an internal AI migration platform that became the team's 3-year strategic roadmap. Co-shaping platform vision with senior leadership.",
      'Owned the SDK platform powering partner integrations, serving millions of daily requests. Transformed the architecture from centralized bottleneck to self-service model across business lines.',
      'Built next-gen insurance products across the full stack. Took on engineering leadership early: mentoring engineers, participating in hiring, and raising team standards.',
    ]);

    const amazonHighlights = Array.from(
      document.querySelectorAll('#journey .journey__highlight p')
    ).map((el) => el.textContent.trim());

    expect(amazonHighlights).toEqual([
      'Architected "Kayl," a pluggable TypeScript library for recording user experience events on Seller Central. Led the full design with L8 to L6 engineers. Started as a temp solution, outlived my tenure by 3+ years.',
      'Picked up React in weeks to lead a frontend project in Seller Central. Quickly became a go-to reference despite a backend focus.',
      'Led projects enhancing multi-language listing experience for Amazon sellers across US, UAE, KSA, Egypt, China, and more.',
      "Trained and mentored engineers while leading multiple projects. Interviewed and hired tens of engineers through Amazon's bar-raising process.",
    ]);

    const wileyDescs = Array.from(
      document.querySelectorAll('#journey .journey__index-desc')
    ).map((el) => el.textContent.trim());

    expect(wileyDescs).toEqual([
      'Led the creation of a standalone automation framework for large-scale system migration using Java, Selenium Grid, and AWS.',
      'Designed and developed mid-tier and front-end layers of Atypon Insights, a web analytics platform for academic publishers.',
    ]);

    const throughlineNote = document
      .querySelector('#journey .journey__throughline-note')
      ?.textContent.trim();
    expect(throughlineNote).toBe(
      'Teaching programming on YouTube since 2013. The throughline that predates and outlasts every role.'
    );
  });

  it('brass figures match existing facts only', () => {
    const figures = Array.from(
      document.querySelectorAll('#journey .journey__figure-value')
    ).map((el) => el.textContent.trim());

    expect(figures).toEqual(['3-year', 'Millions', '< 1', '5+', '3+']);

    const throughlineFigures = Array.from(
      document.querySelectorAll('#journey .journey__throughline-stat-value')
    ).map((el) => el.textContent.trim());

    expect(throughlineFigures).toEqual(['18.7K', '760K+']);

    const wileyFigure = document.querySelector(
      '#journey [data-company="wiley"] .journey__figure'
    );
    expect(wileyFigure).toBeNull();
  });

  it('heading outline is h2 then h3 companies then h4 roles', () => {
    const headings = Array.from(
      document.querySelectorAll(
        '#journey h1, #journey h2, #journey h3, #journey h4, #journey h5, #journey h6'
      )
    );
    const headingTags = headings.map((h) => h.tagName);

    expect(headingTags).toEqual([
      'H2',
      'H3',
      'H4',
      'H4',
      'H4',
      'H3',
      'H4',
      'H3',
      'H4',
      'H4',
      'H3',
    ]);

    const h2s = document.querySelectorAll('#journey h2');
    expect(h2s.length).toBe(1);
    expect(h2s[0].id).toBe('journey-heading');
  });

  it('no interactive or focusable elements inside journey', () => {
    const interactive = document.querySelectorAll(
      '#journey a, #journey button, #journey [tabindex]'
    );
    expect(interactive.length).toBe(0);
  });

  it('decorative nodes and numerals are aria-hidden', () => {
    const nodes = document.querySelectorAll('#journey .journey__node');
    expect(nodes.length).toBeGreaterThan(0);
    nodes.forEach((node) => {
      expect(node.getAttribute('aria-hidden')).toBe('true');
    });

    const numerals = document.querySelectorAll('#journey .journey__act-numeral');
    expect(numerals.length).toBe(3);
    numerals.forEach((numeral) => {
      expect(numeral.getAttribute('aria-hidden')).toBe('true');
    });

    const highlightIcons = document.querySelectorAll(
      '#journey .journey__highlight-icon'
    );
    expect(highlightIcons.length).toBe(4);
    highlightIcons.forEach((icon) => {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('tags are list items with an accessible label', () => {
    const tagLists = document.querySelectorAll('#journey .journey__tags');
    expect(tagLists.length).toBe(4);

    tagLists.forEach((list) => {
      expect(list.tagName).toBe('UL');
      expect(list.getAttribute('aria-label')).toBeTruthy();
    });

    const tags = document.querySelectorAll('#journey .journey__tag');
    expect(tags.length).toBe(20);
    tags.forEach((tag) => {
      expect(tag.tagName).toBe('LI');
    });
  });
});


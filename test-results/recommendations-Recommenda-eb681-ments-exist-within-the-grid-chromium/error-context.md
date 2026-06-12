# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: recommendations.spec.js >> Recommendations - DOM Structure >> exactly two recommendation cards (article elements) exist within the grid
- Location: tests/e2e/recommendations.spec.js:25:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e3]:
    - navigation "Main navigation" [ref=e4]:
      - link "by noor .io" [ref=e5] [cursor=pointer]:
        - /url: "#hero"
        - generic [ref=e6]: by
        - generic [ref=e7]: noor
        - generic [ref=e8]: .io
      - list [ref=e9]:
        - listitem [ref=e10]:
          - link "Highlights" [ref=e11] [cursor=pointer]:
            - /url: "#highlights"
        - listitem [ref=e12]:
          - link "Skills" [ref=e13] [cursor=pointer]:
            - /url: "#skills"
        - listitem [ref=e14]:
          - link "Connect" [ref=e15] [cursor=pointer]:
            - /url: "#links"
        - listitem [ref=e16]:
          - link "Projects" [ref=e17] [cursor=pointer]:
            - /url: "#projects"
        - listitem [ref=e18]:
          - link "Resources" [ref=e19] [cursor=pointer]:
            - /url: /technical-interview-preparation-kit/
  - main [ref=e20]:
    - region "Introduction" [ref=e21]:
      - img "Mohammad Noor Abu Khlaif — Software Engineer, AI Advocate, and Tech Educator" [ref=e23]
      - heading "Mohammad Noor" [level=1] [ref=e24]
      - paragraph [ref=e25]: I build tools that help engineers move faster
      - paragraph [ref=e26]: Software Engineer · AI Advocate · Tech Educator
      - generic [ref=e27]:
        - link "Let's Connect" [ref=e28] [cursor=pointer]:
          - /url: https://cal.com/mohammad-noor
        - link "Resume" [ref=e29] [cursor=pointer]:
          - /url: /mohammad-noor-abu-khlaif-software-engineer-resume.pdf
        - generic [ref=e30]:
          - link "LinkedIn" [ref=e31] [cursor=pointer]:
            - /url: https://go.bynoor.io/linkedin
            - img [ref=e32]
          - link "GitHub" [ref=e34] [cursor=pointer]:
            - /url: https://go.bynoor.io/github
            - img [ref=e35]
          - link "Code with Noor on YouTube" [ref=e37] [cursor=pointer]:
            - /url: https://go.bynoor.io/youtube
            - img [ref=e38]
          - link "Email" [ref=e40] [cursor=pointer]:
            - /url: https://go.bynoor.io/email
            - img [ref=e41]
      - button "Scroll to highlights section" [ref=e43] [cursor=pointer]:
        - img [ref=e44]
    - separator [ref=e46]
    - region "Highlights" [ref=e47]:
      - generic [ref=e48]:
        - heading "Highlights" [level=2] [ref=e49]
        - generic [ref=e50]:
          - generic [ref=e51]:
            - generic [ref=e52]: 🤖
            - heading "AI Platform Builder" [level=3] [ref=e53]
            - paragraph [ref=e54]: Built an AI-powered migration platform that turned weeks of work into hours
          - generic [ref=e55]:
            - generic [ref=e56]: 🏆
            - heading "AI Pioneer & Champion" [level=3] [ref=e57]
            - paragraph [ref=e58]: Recognized for pioneering AI adoption and training hundreds of engineers
          - generic [ref=e59]:
            - generic [ref=e60]: 🎬
            - heading "Teaching Since 2012" [level=3] [ref=e61]
            - paragraph [ref=e62]: YouTube educator with 18.6K subscribers and 750K+ views
          - generic [ref=e63]:
            - generic [ref=e64]: ⚙️
            - heading "9+ Years in Production" [level=3] [ref=e65]
            - paragraph [ref=e66]: Designed and maintained systems handling millions of daily requests
          - generic [ref=e67]:
            - generic [ref=e68]: 👥
            - heading "Engineering Leader" [level=3] [ref=e69]
            - paragraph [ref=e70]: Mentored and developed engineers across distributed global teams
    - separator [ref=e71]
    - region "Skills & Expertise" [ref=e72]:
      - generic [ref=e73]:
        - heading "Skills & Expertise" [level=2] [ref=e74]
        - generic [ref=e75]:
          - heading "Languages" [level=3] [ref=e76]
          - generic [ref=e77]:
            - generic [ref=e78]: Kotlin
            - generic [ref=e79]: Java
            - generic [ref=e80]: Python
            - generic [ref=e81]: TypeScript
            - generic [ref=e82]: JavaScript
            - generic [ref=e83]: Scala
        - generic [ref=e84]:
          - heading "Technologies" [level=3] [ref=e85]
          - generic [ref=e86]:
            - generic [ref=e87]: Spring Boot
            - generic [ref=e88]: GraphQL
            - generic [ref=e89]: gRPC
            - generic [ref=e90]: AWS
            - generic [ref=e91]: React
            - generic [ref=e92]: NodeJS
            - generic [ref=e93]: OpenAPI
        - generic [ref=e94]:
          - heading "Areas of Expertise" [level=3] [ref=e95]
          - generic [ref=e96]:
            - generic [ref=e97]: SDKs
            - generic [ref=e98]: Platform Engineering
            - generic [ref=e99]: AI-native Architectures
            - generic [ref=e100]: MCP
            - generic [ref=e101]: Agent Frameworks
            - generic [ref=e102]: Microservices
            - generic [ref=e103]: Backend
            - generic [ref=e104]: Full-Stack
        - generic [ref=e105]:
          - heading "Leadership" [level=3] [ref=e106]
          - generic [ref=e107]:
            - generic [ref=e108]: Engineering Leadership
            - generic [ref=e109]: Mentoring
            - generic [ref=e110]: Hiring
            - generic [ref=e111]: Coaching
            - generic [ref=e112]: Training
            - generic [ref=e113]: AI Advocacy
    - separator [ref=e114]
    - region "Recommendations" [ref=e115]:
      - generic [ref=e116]:
        - heading "Recommendations" [level=2] [ref=e117]
        - generic [ref=e118]:
          - article [ref=e119]:
            - blockquote [ref=e120]:
              - paragraph [ref=e121]: "\"Noor was part of my team for about a year. I was impressed with his ability to learn quickly and deliver under tight deadlines. He always came across as an organized professional and I could always rely on him to give a clear picture of his progress on a weekly basis. I'd happily recommend him as a motivated software engineer.\""
            - generic [ref=e122]:
              - generic [ref=e123]: Aamer Abbas Software Engineering Management Former Manager at Amazon December 2021
              - link "View Aamer Abbas's LinkedIn profile" [ref=e124] [cursor=pointer]:
                - /url: https://www.linkedin.com/in/abbasaamer/
                - img [ref=e125]
          - article [ref=e127]:
            - blockquote [ref=e128]:
              - paragraph [ref=e129]: "\"Noor is a rising star. He was less than a month old in the company when he took ownership of a time sensitive, business critical emerging market solution implementation for Amazon MENA customers. The solution was not only well defined but also involved making changes in multiple platform teams code base across Amazon. With little supervision and guidance he was able to work with different code bases and single handedly code completed, drove code reviews with remote teams and successfully executed the deployment on time. His passion for continuous learning and sharing knowledge are commendable. He is an asset to any team and will have him in the team anytime, anywhere.\""
            - generic [ref=e130]:
              - generic [ref=e131]: Nagarajan Raju Engineering Leader at Amazon | Building AI Solutions | Bar Raiser | ex-Microsoft & Oracle Former Manager at Amazon November 2020
              - link "View Nagarajan Raju's LinkedIn profile" [ref=e132] [cursor=pointer]:
                - /url: https://www.linkedin.com/in/nagarajanraju/
                - img [ref=e133]
    - separator [ref=e135]
    - region "Connect" [ref=e136]:
      - generic [ref=e137]:
        - heading "Connect" [level=2] [ref=e138]
        - generic [ref=e139]:
          - paragraph [ref=e140]: Whether it's hiring, consulting, or a tech conversation, I'm one call away.
          - link "Let's Connect" [ref=e141] [cursor=pointer]:
            - /url: https://cal.com/mohammad-noor
            - img [ref=e142]
            - text: Let's Connect
          - generic [ref=e144]:
            - link "LinkedIn" [ref=e145] [cursor=pointer]:
              - /url: https://go.bynoor.io/linkedin
              - img [ref=e146]
              - text: LinkedIn
            - link "Email" [ref=e148] [cursor=pointer]:
              - /url: https://go.bynoor.io/email
              - img [ref=e149]
              - text: Email
            - link "Resume" [ref=e151] [cursor=pointer]:
              - /url: /mohammad-noor-abu-khlaif-software-engineer-resume.pdf
              - img [ref=e152]
              - text: Resume
        - heading "More from Noor" [level=3] [ref=e154]
        - generic [ref=e155]:
          - link "GitHub" [ref=e156] [cursor=pointer]:
            - /url: https://go.bynoor.io/github
            - img [ref=e157]
            - generic [ref=e159]: GitHub
          - link "Twitter / X" [ref=e160] [cursor=pointer]:
            - /url: https://go.bynoor.io/twitter
            - img [ref=e161]
            - generic [ref=e163]: Twitter / X
          - link "StackOverflow" [ref=e164] [cursor=pointer]:
            - /url: https://go.bynoor.io/sof
            - img [ref=e165]
            - generic [ref=e167]: StackOverflow
          - link "HackerRank" [ref=e168] [cursor=pointer]:
            - /url: https://go.bynoor.io/hr
            - img [ref=e169]
            - generic [ref=e171]: HackerRank
        - link "Code with Noor on YouTube" [ref=e173] [cursor=pointer]:
          - /url: https://go.bynoor.io/youtube
          - img [ref=e174]
          - generic [ref=e176]: Code with Noor
    - separator [ref=e177]
    - region "Recently Built by Noor" [ref=e178]:
      - generic [ref=e179]:
        - heading "Recently Built by Noor" [level=2] [ref=e180]
        - generic [ref=e181]:
          - link "areej.io Personal brand site for a Platform & Observability Lead." [ref=e182] [cursor=pointer]:
            - /url: https://areej.io/
            - heading "areej.io" [level=3] [ref=e183]
            - paragraph [ref=e184]: Personal brand site for a Platform & Observability Lead.
          - link "HireFound Recruitment brand and job portal for consultant Yasmin Blasi." [ref=e185] [cursor=pointer]:
            - /url: https://mohnoor94.github.io/hire-found/
            - heading "HireFound" [level=3] [ref=e186]
            - paragraph [ref=e187]: Recruitment brand and job portal for consultant Yasmin Blasi.
  - contentinfo [ref=e188]:
    - link "bynoor.io" [ref=e189] [cursor=pointer]:
      - /url: "#hero"
    - generic [ref=e190]:
      - generic [ref=e191]: ✨ fresh out of localhost
      - paragraph [ref=e192]: Brand new site. Still tweaking, still shipping.
    - paragraph [ref=e193]: 2012 – 2026 · Built with 🤍
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import AxeBuilder from '@axe-core/playwright';
  3   | 
  4   | // --- DOM Structure Tests ---
  5   | // Validates: Requirements 1.1, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 5.2, 5.3, 6.4, 7.1, 7.2, 7.3, 7.5
  6   | 
  7   | test.describe('Recommendations - DOM Structure', () => {
  8   |   test.beforeEach(async ({ page }) => {
  9   |     await page.goto('/');
> 10  |     await page.waitForLoadState('networkidle');
      |                ^ Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
  11  |   });
  12  | 
  13  |   test('section exists with correct id, aria-labelledby, and data-section-accent', async ({ page }) => {
  14  |     const section = page.locator('section#recommendations');
  15  |     await expect(section).toHaveAttribute('aria-labelledby', 'recommendations-heading');
  16  |     await expect(section).toHaveAttribute('data-section-accent', 'tertiary');
  17  |   });
  18  | 
  19  |   test('heading h2 with text "Recommendations" exists inside section', async ({ page }) => {
  20  |     const heading = page.locator('#recommendations h2#recommendations-heading');
  21  |     await expect(heading).toBeVisible();
  22  |     await expect(heading).toHaveText('Recommendations');
  23  |   });
  24  | 
  25  |   test('exactly two recommendation cards (article elements) exist within the grid', async ({ page }) => {
  26  |     const cards = page.locator('#recommendations .recommendations__grid article.recommendations__card');
  27  |     await expect(cards).toHaveCount(2);
  28  |   });
  29  | 
  30  |   test('each card contains a blockquote with non-empty text content', async ({ page }) => {
  31  |     const blockquotes = page.locator('#recommendations .recommendations__card blockquote.recommendations__quote');
  32  |     await expect(blockquotes).toHaveCount(2);
  33  | 
  34  |     for (let i = 0; i < 2; i++) {
  35  |       const text = await blockquotes.nth(i).textContent();
  36  |       expect(text.trim().length).toBeGreaterThan(0);
  37  |     }
  38  |   });
  39  | 
  40  |   test('each card contains a footer with recommender name, title, relationship, and date', async ({ page }) => {
  41  |     const footers = page.locator('#recommendations .recommendations__card footer.recommendations__attribution');
  42  |     await expect(footers).toHaveCount(2);
  43  | 
  44  |     for (let i = 0; i < 2; i++) {
  45  |       const footer = footers.nth(i);
  46  |       const name = footer.locator('.recommendations__name');
  47  |       const title = footer.locator('.recommendations__title');
  48  |       const relationship = footer.locator('.recommendations__relationship');
  49  |       const date = footer.locator('.recommendations__date');
  50  | 
  51  |       await expect(name).toBeVisible();
  52  |       await expect(title).toBeVisible();
  53  |       await expect(relationship).toBeVisible();
  54  |       await expect(date).toBeVisible();
  55  | 
  56  |       expect((await name.textContent()).trim().length).toBeGreaterThan(0);
  57  |       expect((await title.textContent()).trim().length).toBeGreaterThan(0);
  58  |       expect((await relationship.textContent()).trim().length).toBeGreaterThan(0);
  59  |       expect((await date.textContent()).trim().length).toBeGreaterThan(0);
  60  |     }
  61  |   });
  62  | 
  63  |   test('LinkedIn badge links have correct hrefs, target, rel, and aria-label', async ({ page }) => {
  64  |     const badges = page.locator('#recommendations .recommendations__linkedin-badge');
  65  |     await expect(badges).toHaveCount(2);
  66  | 
  67  |     // Card 1: Aamer Abbas
  68  |     const badge1 = badges.nth(0);
  69  |     await expect(badge1).toHaveAttribute('href', 'https://www.linkedin.com/in/abbasaamer/');
  70  |     await expect(badge1).toHaveAttribute('target', '_blank');
  71  |     await expect(badge1).toHaveAttribute('rel', 'noopener');
  72  |     const ariaLabel1 = await badge1.getAttribute('aria-label');
  73  |     expect(ariaLabel1).toBeTruthy();
  74  |     expect(ariaLabel1.length).toBeGreaterThan(0);
  75  | 
  76  |     // Card 2: Nagarajan Raju
  77  |     const badge2 = badges.nth(1);
  78  |     await expect(badge2).toHaveAttribute('href', 'https://www.linkedin.com/in/nagarajanraju/');
  79  |     await expect(badge2).toHaveAttribute('target', '_blank');
  80  |     await expect(badge2).toHaveAttribute('rel', 'noopener');
  81  |     const ariaLabel2 = await badge2.getAttribute('aria-label');
  82  |     expect(ariaLabel2).toBeTruthy();
  83  |     expect(ariaLabel2.length).toBeGreaterThan(0);
  84  |   });
  85  | 
  86  |   test('decorative blob has aria-hidden="true" and data-parallax attribute', async ({ page }) => {
  87  |     const blob = page.locator('#recommendations .decorative-blob');
  88  |     await expect(blob).toHaveAttribute('aria-hidden', 'true');
  89  |     const parallax = await blob.getAttribute('data-parallax');
  90  |     expect(parallax).not.toBeNull();
  91  |   });
  92  | 
  93  |   test('section appears after skills section and before connect section in DOM order', async ({ page }) => {
  94  |     const sections = page.locator('main section, body section');
  95  |     const allSections = await sections.all();
  96  |     const ids = await Promise.all(allSections.map((s) => s.getAttribute('id')));
  97  | 
  98  |     const skillsIndex = ids.indexOf('skills');
  99  |     const recommendationsIndex = ids.indexOf('recommendations');
  100 |     const connectIndex = ids.indexOf('links');
  101 | 
  102 |     expect(skillsIndex).toBeGreaterThanOrEqual(0);
  103 |     expect(recommendationsIndex).toBeGreaterThanOrEqual(0);
  104 |     expect(connectIndex).toBeGreaterThanOrEqual(0);
  105 |     expect(recommendationsIndex).toBeGreaterThan(skillsIndex);
  106 |     expect(recommendationsIndex).toBeLessThan(connectIndex);
  107 |   });
  108 | 
  109 |   test('animation attributes: data-animate on cards, data-animate-stagger on container', async ({ page }) => {
  110 |     const cards = page.locator('#recommendations .recommendations__card');
```
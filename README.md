# Short Form Story Studio

Build a professional, production-ready web application called "CreatorKit Studio" for content creators worldwide.



CORE REQUIREMENTS:

Create a fully responsive, fast, lightweight and functional website for mobile phones, tablets and desktop computers.



DESIGN:

- Pure white background with a clean, premium, modern SaaS aesthetic.

- Dark text, subtle borders, tasteful blue accents and generous whitespace.

- Mobile-first responsive design.

- Smooth, lightweight transitions without heavy animations.

- Professional typography, consistent spacing and polished cards.

- No dark background, unnecessary gradients or excessive visual effects.

- Sticky navigation on desktop and a compact mobile navigation.

- Excellent usability on small Android screens.



BRAND:

Name: CreatorKit Studio

Tagline: Everything creators need, in one place.

Language: English.

Target audience: TikTok, Instagram Reels and YouTube Shorts creators worldwide.



HOMEPAGE:

1. Header with logo, Tools, Features, How It Works and About.

2. Hero heading: "Create Better Content. In Less Time."

3. Subtitle explaining the free creator tools.

4. A prominent search box to find tools.

5. A featured Creator Workflow tool.

6. Individual tool cards with icons, descriptions and working links.

7. Popular tools section.

8. How It Works section.

9. FAQ section.

10. Professional footer with About, Contact, Privacy Policy and Terms.



BUILD THESE FUNCTIONAL TOOLS:



1. AI Caption Generator:

Allow users to enter a topic, choose a platform and select a tone.

Generate captions using a genuine configured AI API.

If the API is not configured, clearly explain that AI generation is temporarily unavailable. Never display fake AI-generated results.



2. Viral Hook Generator:

Accept a video topic and generate multiple opening-hook suggestions using the configured AI API.



3. Hashtag Assistant:

Accept a topic and platform and generate relevant hashtag suggestions through the configured AI API. Do not claim hashtags are trending without live trend data.



4. Content Idea Generator:

Generate useful content ideas based on a user-selected niche and platform.



5. Bio Generator:

Generate profile bio suggestions based on a user's niche and preferred style.



6. Thumbnail Text Generator:

Generate short, attention-grabbing thumbnail text suggestions based on the video topic.



7. Social Media Image Resizer:

Implement actual client-side image resizing using a reliable browser image-processing approach. Support common image formats and provide downloadable results.



8. Image Compressor:

Actually compress supported images in the browser. Allow users to upload an image, select quality and download the compressed result. Display original and compressed file sizes.



9. Creator Workflow:

Let users enter one topic and select a platform. Generate a complete content package containing a hook, caption, relevant hashtags and thumbnail text.

Use the configured AI API for generation. Clearly handle missing API configuration and errors.



FUNCTIONALITY:

- Every visible button must perform its stated action.

- Tool cards must open their corresponding working tools.

- Implement search and category filters.

- Add copy-to-clipboard buttons with success feedback.

- Add input validation, loading states, empty states and helpful error messages.

- Include clear, accessible upload controls and download buttons.

- Ensure keyboard accessibility and readable contrast.

- Keep image processing client-side whenever practical.

- Never expose secret API keys in frontend code.

- Never use mock functionality disguised as a working feature.

- Do not claim a tool works until its core functionality has been implemented and tested.



PERFORMANCE:

- Optimize for fast loading on mobile data connections.

- Lazy-load nonessential images and components.

- Avoid unnecessary libraries and oversized assets.

- Minimize JavaScript bundles and layout shifts.

- Use responsive layouts without horizontal scrolling.

- Optimize Core Web Vitals and accessibility.

- Respect reduced-motion preferences.



SEO:

- Unique page titles and meta descriptions.

- Semantic HTML and proper heading hierarchy.

- Canonical URL configuration when the production domain is available.

- Generate an appropriate sitemap and robots.txt.

- Add useful, original explanatory content to each tool page.

- Avoid thin, automatically generated SEO pages.



PRIVACY AND SECURITY:

- Never expose API credentials.

- Validate user inputs.

- Explain how uploaded images and submitted data are handled.

- Do not upload user images to a server unless necessary and clearly disclosed.

- Create accurate Privacy Policy and Terms pages without inventing certifications or legal guarantees.



MONETIZATION READINESS:

- Structure the application to support future Google AdSense integration.

- Do not add fake ads, forced ad clicks or intrusive popups.

- Keep the layout suitable for unobtrusive advertising placements.

- Do not claim Google AdSense approval.



IMPORTANT:

Build the actual application, not just a visual mockup.

Prioritize working image tools first because they can function without a paid AI API.

Keep the code organized, reusable, accessible and easy to maintain.

After implementation, identify any incomplete features, required API configuration and testing steps.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://short-form-story-studio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fdeb5a60-90da-4ea4-85eb-c331b8a851c3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

# leizhang-research.github.io

Multi-page academic website for GitHub Pages.

## Site structure

- `index.html` (Bio)
- `papers.html`
- `talks.html`
- `news.html`
- `experience.html`
- `projects.html`
- `teaching.html`

Shared assets:

- `assets/css/site.css` for styling
- `assets/js/site.js` for rendering
- `assets/js/site-data.js` for all editable content

## How to update content

Edit only this file for most updates:

- `assets/js/site-data.js`

Inside it, you can change:

- Profile (name, pronouns, role, organization, avatar)
- CV button path
- Social links
- Navigation labels/files
- Papers, talks, news, experience, projects, teaching entries
- Education cards

## CV downloads on GitHub Pages

Yes, GitHub Pages supports downloadable files.

Current CV path:

- `assets/files/Lei_Zhang_CV.pdf`

CV source file:

- `assets/files/Lei_Zhang_CV.tex`

To rebuild PDF from LaTeX:

- `pdflatex -interaction=nonstopmode -halt-on-error -output-directory=assets/files assets/files/Lei_Zhang_CV.tex`

Keep the PDF filename as `Lei_Zhang_CV.pdf` so the button continues to work.

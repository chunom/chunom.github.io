# Nom Zine

A warm, minimal Hugo static site for introducing Chữ Nôm. It includes content pages, curated resources, client-side search, community links, a 404 page, and a GitHub Pages deployment workflow.

## Run locally

Install Hugo Extended, then run:

```bash
hugo server
```

The site will usually be available at `http://localhost:1313/`.

To test a production build:

```bash
hugo --minify
```

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. In the repository settings, open **Pages**.
3. Set **Build and deployment** to **GitHub Actions**.
4. Push to the `main` branch or run the workflow manually from the Actions tab.

The workflow file is `.github/workflows/hugo.yml`.

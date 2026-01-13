[![Build Frontend](https://github.com/DHBW-KA-Webengineering/Template_Next/actions/workflows/build-frontend.yml/badge.svg)](https://github.com/DHBW-KA-Webengineering/Template_Next/actions/workflows/build-frontend.yml)
[![Publish Frontend](https://github.com/DHBW-KA-Webengineering/Template_Next/actions/workflows/publish-frontend.yml/badge.svg)](https://github.com/DHBW-KA-Webengineering/Template_Next/actions/workflows/publish-frontend.yml)

# Template_Next

This repository is a template with a working GitHub action for the build and GitHub pages.

## How to use this template

After creating a repo with this template, deploy works automatically with each push to github pages. The template is deployed to [dhbw-ka-webengineering.github.io/Template_Next/](https://dhbw-ka-webengineering.github.io/Template_Next/)

### Todo:

- Because of the `Template_Next` path in the URL, `Template_Next` is required in line 8 of the [package.json file](package.json) file￼. If you deploy the repository to a different URL (e.g., if you choose a different name for your repo), you will need to adapt or remove this part.
- Enable GitHub Pages in your repository’s Settings and set the source to GitHub Actions.
- Adjust the path of the badges at the beginning of this README file so that they reference your own repository instead of the template.

# Next

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm install
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

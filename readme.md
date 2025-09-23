<h1 align="center">Sekolah Alam LMS Frontend</h1>

## Description
This is the **frontend** for the **Sekolah Alam Learning Management System (LMS)**, built using **Next.js**, **TypeScript**, and **Tailwind CSS**. The platform is designed to provide accessible education with a focus on **environmental awareness** and **food security**, targeting students in rural areas. The frontend integrates with a Node.js backend powered by Express and Prisma to deliver a seamless user experience.

## Key Features
- **User Management**: Interfaces for students, teachers, and volunteers.
- **Learning Materials**: Interactive delivery of videos, texts, and images.
- **Collaboration**: Tools to support community-based learning.
- **Progress Tracking**: Visual dashboards to monitor achievements and learning outcomes.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Theme Support**: Light and dark mode with `next-themes`.
- **Interactive UI**: Drag-and-drop functionality with `@dnd-kit` and data visualization with `recharts`.

## Tech Stack
- **Framework**: Next.js 15.5.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS, `@tailwindcss/postcss`, `tw-animate-css`
- **UI Components**: Radix UI (`@radix-ui/*`), `lucide-react`, `@tabler/icons-react`
- **Data Visualization**: `recharts`
- **State Management**: React 19.1.0
- **Drag-and-Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **Validation**: `zod`
- **Notifications**: `sonner`
- **Linting**: ESLint with `eslint-config-next`
- **Commit Linting**: `commitlint` with conventional commits
- **Git Hooks**: `husky` for pre-commit hooks
- **Build Tool**: Turbopack (used in `next dev` and `next build`)

## Project Structure
```
├── app                   # Next.js app directory (pages and layouts)
│   ├── (admin)           # Admin-specific routes (course, dashboard, teacher)
│   ├── favicon.ico       # Favicon
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Root page
├── components            # Reusable React components
│   ├── ui                # UI primitives (avatar, button, table, etc.)
│   └── *.tsx             # Custom components (sidebar, header, charts, etc.)
├── hooks                 # Custom React hooks (e.g., use-mobile.ts)
├── lib                   # Utility functions (e.g., utils.ts)
├── public                # Static assets (SVGs, favicon)
├── .next                 # Next.js build output
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
├── postcss.config.mjs    # PostCSS configuration
├── eslint.config.mjs     # ESLint configuration
├── .gitignore            # Git ignore file
├── .gitlab-ci.yml        # CI/CD configuration
├── .husky                # Husky configuration for Git hooks
├── README.md             # Project documentation
```

## Prerequisites
- **Node.js**: v20 or later
- **npm**: v10 or later
- **Git**: For version control

## Installation
1. Clone the repository:
   ```bash
   git clone https://gitlab.com/pmld-sekolah-alam/frontend-sekolah-alam.git
   cd frontend-sekolah-alam
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Prepare Git hooks:
   ```bash
   npm run prepare
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## Scripts
- `npm run dev`: Start the development server with Turbopack.
- `npm run build`: Build the app for production with Turbopack.
- `npm run start`: Run the production server.
- `npm run lint`: Run ESLint to check for code quality issues.
- `npm run prepare`: Set up Husky Git hooks.

## Development Guidelines
- **Code Style**: Follow ESLint rules defined in `eslint.config.mjs`.
- **Commit Messages**: Use conventional commits enforced by `@commitlint/config-conventional`.
- **Git Hooks**: Husky enforces pre-commit checks (e.g., linting).
- **Components**: Use reusable components in the `components` directory and Radix UI primitives in `components/ui`.
- **Styling**: Use Tailwind CSS classes for styling. Global styles are in `app/globals.css`.
- **Type Safety**: Ensure all components and hooks are typed using TypeScript.
- **Git Branches**: Use branches like `dev`, `dev-arga`, `dev-damar`, etc., for development.

## Deployment
The project is configured for deployment on Vercel. Ensure the `.vercel/project.json` is correctly set up with your Vercel project ID. To deploy:
1. Push changes to your repository.
2. Connect the repository to Vercel.
3. Configure environment variables in Vercel (if any).
4. Deploy using Vercel's CLI or dashboard.

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b dev-<your-name>`).
3. Commit your changes with conventional commit messages (`git commit -m "feat: add new feature"`).
4. Push to the branch (`git push origin dev-<your-name>`).
5. Create a pull request to the `dev` branch.

## License
This project is licensed under the MIT License.

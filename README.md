# Split Smart

Split Smart is a modern full-stack application designed to simplify cost and responsibility sharing among teams or groups. Built with **Next.js**, it leverages **server actions**, **Convex backend**, and **Clerk** for authentication — offering a seamless and secure user experience.

## 🧑‍🤝‍🧑 Contributors

- **Zeynep Bahar Yılmaz** – [ylmzbhr1@gmail.com](mailto:ylmzbhr1@gmail.com)
- **İmren Rahbay** – [imrenrahbay@gmail.com](mailto:imrenrahbay@gmail.com)
- **Ahmet Yavuz** – [1yavuzahmet@gmail.com](mailto:1yavuzahmet@gmail.com)
- **Abdullah Koyuncu** – [wisewebworks@outlook.com](mailto:wisewebworks@outlook.com)

---

## 🚀 Features

- ✨ Auth and user management via [Clerk](https://clerk.dev/)
- 📊 Data visualization with [Recharts](https://recharts.org/)
- 🔁 Background jobs and workflows using [Inngest](https://www.inngest.com/)
- 📬 Email notifications powered by [Resend](https://resend.com/)
- ☁️ Real-time database & backend via [Convex](https://convex.dev/)
- 🎨 Customizable UI with [Tailwind CSS](https://tailwindcss.com/) & Radix UI
- ✅ Type-safe forms with [React Hook Form](https://react-hook-form.com/) and [Zod](https://zod.dev/)
- 🌗 Dark mode support via `next-themes`

---

## 🧱 Tech Stack

| Category         | Tools/Libraries                                                                 |
|------------------|----------------------------------------------------------------------------------|
| **Framework**    | [Next.js 15](https://nextjs.org/) (with Turbopack)                              |
| **Database**     | [Convex](https://convex.dev/)                                                   |
| **Auth**         | [Clerk](https://clerk.dev/)                                                     |
| **UI**           | Tailwind CSS, Radix UI, Lucide Icons                                            |
| **Forms & Validations** | React Hook Form, Zod                                                     |
| **Charts**       | Recharts                                                                       |
| **Date Handling**| date-fns, react-day-picker                                                      |
| **Email**        | Resend                                                                          |
| **Async Events** | Inngest, Svix                                                                   |
| **Dev Tools**    | Prettier, ESLint, TypeScript, PostCSS                                           |

---

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/codEdu-Collective/split-smart.git
cd split-smart
````

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file and define necessary environment variables (Clerk keys, Convex URL, Resend API, etc.):

```
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_JWT_ISSUER_DOMAIN=
RESEND_API_KEY=
GEMINI_API_KEY=
```

### 4. Start the development server

```bash
npm run dev
```

---

## 🧪 Available Commands

| Script          | Description                             |
| --------------- | --------------------------------------- |
| `npm run dev`   | Start development server with Turbopack |
| `npm run build` | Build the project for production        |
| `npm start`     | Start production server                 |
| `npm run lint`  | Run ESLint to check for code issues     |
| `npm run check` | Check formatting with Prettier          |
| `npm run write` | Auto-format codebase with Prettier      |

---

## 📁 Project Structure (Simplified)

```
/
├── app
├── components
├── components.json
├── convex
├── eslint.config.mjs
├── hooks
├── lib
├── LICENSE
├── middleware.ts
├── new-env.d.ts
├── next.config.ts
├── next-env.d.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── public
├── README.md
└── tsconfig.json
```

---

## 📝 License

MIT License © 2025
Split Smart Team

---

## 🤝 Acknowledgments

Thanks to all open-source libraries, frameworks, and tools that made Split Smart possible — especially:

* [Next.js](https://nextjs.org/)
* [Clerk](https://clerk.dev/)
* [Convex](https://convex.dev/)
* [Resend](https://resend.com/)
* [Inngest](https://www.inngest.com/)


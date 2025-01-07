# ChatGenius

ChatGenius is a modern web application built with Next.js 14, featuring a sleek user interface and robust authentication system. It provides a platform for real-time chat interactions with an intuitive user experience.

## Features

- 🔐 Secure authentication with Clerk
- 💻 Modern UI built with Radix UI components
- 🎨 Customizable themes with next-themes
- 🔄 State management using Zustand
- 📱 Responsive design
- 🔍 Real-time search functionality
- 👤 User profiles and customization

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ChatGenius.git
cd ChatGenius
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add the necessary environment variables:
```
DATABASE_URL="file:./dev.db"
# Add your Clerk environment variables
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

- `/app` - App router pages and API routes
- `/components` - Reusable UI components
- `/lib` - Utility functions and shared logic
- `/prisma` - Database schema and migrations
- `/public` - Static assets
- `/styles` - Global styles and Tailwind configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
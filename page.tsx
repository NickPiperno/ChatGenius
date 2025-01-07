import { redirect } from "next/navigation";
import { channels } from "@/lib/data";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'ChatGenius',
  description: 'Real-time messaging and collaboration app',
  keywords: ['chat', 'messaging', 'collaboration', 'real-time'],
  authors: [{ name: 'ChatGenius Team' }],
  openGraph: {
    title: 'ChatGenius',
    description: 'Real-time messaging and collaboration app',
    type: 'website',
  },
};

export default function HomePage() {
  // Redirect to the first channel by default
  if (channels.length > 0) {
    redirect(`/channel/${channels[0].id}`);
  }

  return null;
} 
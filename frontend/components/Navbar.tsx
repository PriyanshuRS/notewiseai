import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex gap-6 p-4 border-b">

    <a href="/upload">Upload</a>
    <a href="/documents">Documents</a>
    <a href="/chat">Chat</a>
    <a href="/search">Search</a>
    <a href="/quiz">Quiz</a>

    </nav>
  );
}
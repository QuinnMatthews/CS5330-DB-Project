import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Social Media Research Database",
  description: "Manage and analyze social media data for research purposes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-light`}>
        <div className="container-fluid">
          <div className="row vh-100">
            {/* Sidebar */}
            <nav className="col-md-2 d-none d-md-block bg-dark text-white p-3">
              <h4 className="text-white">Research DB</h4>
              <ul className="nav flex-column mt-4">
                <li className="nav-item">
                  <a className="nav-link text-white" href="/">Home</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/socials">Manage Platforms</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/users">Manage Users</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/posts">Manage Posts</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/projects">Manage Projects</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/search-posts">Search Posts</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="/search-experiments">Search Experiments</a>
                </li>
              </ul>
            </nav>

            {/* Main Content */}
            <main className="col-md-10 ms-sm-auto px-4 py-3">
              {/* Top Navbar */}
              <nav className="navbar navbar-light bg-white mb-4 border-bottom">
                <span className="navbar-brand mb-0 h5">Social Media Research Database</span>
              </nav>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

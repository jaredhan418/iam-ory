"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/clients", label: "OAuth Clients", icon: "🔑" },
  { href: "/tokens/issue", label: "Issue M2M Token", icon: "🎫" },
  { href: "/tokens/verify", label: "Verify Token", icon: "✅" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-lg font-bold text-indigo-700">Ory Hydra Admin</h1>
        <p className="text-xs text-gray-500 mt-0.5">OAuth 2.0 Management</p>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Hydra Admin API:{" "}
          <span className="font-mono text-gray-600 break-all">
            {process.env.NEXT_PUBLIC_HYDRA_ADMIN_URL ?? "http://localhost:4445"}
          </span>
        </p>
      </div>
    </aside>
  );
}

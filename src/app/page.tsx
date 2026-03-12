import Link from "next/link";

const cards = [
  {
    href: "/clients",
    title: "OAuth Clients",
    description:
      "Create and manage OAuth 2.0 clients registered with your Ory Hydra instance.",
    icon: "🔑",
  },
  {
    href: "/tokens/issue",
    title: "Issue M2M Token",
    description:
      "Use the client credentials grant to issue a machine-to-machine access token.",
    icon: "🎫",
  },
  {
    href: "/tokens/verify",
    title: "Verify / Introspect Token",
    description:
      "Introspect an access token to verify its validity, scope, and metadata.",
    icon: "✅",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to the Ory Hydra Admin UI. Manage OAuth 2.0 clients and
          tokens from the panels below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-3 text-3xl">{card.icon}</div>
            <h3 className="text-base font-semibold text-gray-900">
              {card.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{card.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Quick Setup Guide
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
          <li>
            Configure{" "}
            <code className="font-mono bg-gray-100 px-1 rounded">
              HYDRA_ADMIN_URL
            </code>{" "}
            and{" "}
            <code className="font-mono bg-gray-100 px-1 rounded">
              HYDRA_PUBLIC_URL
            </code>{" "}
            in your{" "}
            <code className="font-mono bg-gray-100 px-1 rounded">
              .env.local
            </code>{" "}
            file.
          </li>
          <li>
            Go to <strong>OAuth Clients</strong> and create a new client with
            the{" "}
            <code className="font-mono bg-gray-100 px-1 rounded">
              client_credentials
            </code>{" "}
            grant type.
          </li>
          <li>
            Go to <strong>Issue M2M Token</strong>, enter the client&apos;s
            credentials, and request an access token.
          </li>
          <li>
            Go to <strong>Verify Token</strong> and paste the access token to
            introspect its claims.
          </li>
        </ol>
      </div>
    </div>
  );
}

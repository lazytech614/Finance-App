export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: "Welth",
      description:
        "Welth is your personal finance companion. Track expenses, manage budgets, and grow your wealth efficiently.",
      links: [],
    },
    {
      title: "Quick Links",
      links: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Transactions", href: "/transactions" },
        { label: "Reports", href: "/reports" },
        { label: "Settings", href: "/settings" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "Blog", href: "/blog" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
    {
      title: "Contact",
      links: [
        { label: "support@welth.com", href: "mailto:support@welth.com" },
        { label: "+91 123 456 7890", href: "tel:+911234567890" },
      ],
      socials: [
        { label: "Twitter", href: "#" },
        { label: "LinkedIn", href: "#" },
        { label: "Instagram", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-blue-100 text-gray-700 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {sections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
              {section.description && (
                <p className="text-sm text-gray-600">{section.description}</p>
              )}
              {section.links.length > 0 && (
                <ul className="space-y-2 text-sm">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.href}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {section.socials && (
                <div className="flex mt-1 space-x-3 text-sm">
                  {section.socials.map((social, i) => (
                    <a
                      key={i}
                      href={social.href}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
          &copy; {currentYear} Welth. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
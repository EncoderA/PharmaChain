import {
  Package,
  ScanLine,
  TrendingUp,
  FileCheck,
  Users,
  BarChart3,
} from "lucide-react";

const services = [
  {
    icon: Package,
    title: "Drug Registration",
    description:
      "Register pharmaceutical products on the blockchain with immutable records of manufacturing details, batch numbers, and expiry dates.",
    highlight: "Immutable Records",
  },
  {
    icon: ScanLine,
    title: "Product Verification",
    description:
      "Instantly verify drug authenticity with QR code scanning. Detect counterfeits before they reach patients.",
    highlight: "Real-time Scanning",
  },
  {
    icon: TrendingUp,
    title: "Supply Chain Tracking",
    description:
      "Monitor the entire journey of every product — from manufacturer to distributor to wholesaler to pharmacist.",
    highlight: "End-to-End Visibility",
  },
  {
    icon: FileCheck,
    title: "Smart Compliance",
    description:
      "Automated regulatory compliance checks powered by smart contracts that enforce FDA and WHO standards.",
    highlight: "Automated Auditing",
  },
  {
    icon: Users,
    title: "Stakeholder Management",
    description:
      "Onboard and manage all supply chain participants — manufacturers, distributors, wholesalers, and pharmacists.",
    highlight: "Role-based Access",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description:
      "Comprehensive dashboards and reports that provide actionable insights across your supply chain operations.",
    highlight: "Data-driven Insights",
  },
];

export function Services() {
  return (
    <div className="py-20 px-8">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-base uppercase text-foreground tracking-wider mb-4">
          Our Services
        </h2>
        <p className="text-3xl md:text-4xl font-bold tracking-tighter max-w-2xl mx-auto">
          Everything You Need to{" "}
          <span className="bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
            Secure Your Supply Chain
          </span>
        </p>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-base leading-relaxed">
          From drug registration to real-time verification, PharmaChain provides
          a complete suite of blockchain-powered tools.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.title}
              className="group relative p-6 rounded-xl border border-accent bg-background hover:border-primary/50 transition-all duration-300 overflow-hidden"
            >
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                {/* Icon */}
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>

                {/* Highlight Badge */}
                <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-3">
                  {service.highlight}
                </span>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

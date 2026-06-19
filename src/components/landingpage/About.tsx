import { Shield, Target, Eye, Award } from "lucide-react";

const stats = [
  { label: "Supply Chains Secured", value: "500+" },
  { label: "Drugs Verified", value: "1M+" },
  { label: "Active Partners", value: "200+" },
  { label: "Countries Reached", value: "30+" },
];

const values = [
  {
    icon: Shield,
    title: "Security First",
    description:
      "Every transaction is secured with military-grade encryption and blockchain immutability, ensuring your supply chain can never be compromised.",
  },
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To eliminate counterfeit pharmaceuticals from the global supply chain by making every drug traceable, verifiable, and trustworthy.",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description:
      "We believe in complete visibility — from the moment a drug is manufactured until it reaches the patient's hands.",
  },
  {
    icon: Award,
    title: "Industry Leading",
    description:
      "Built on cutting-edge blockchain technology and trusted by leading pharmaceutical companies worldwide.",
  },
];

export function About() {
  return (
    <div className="py-20 px-8">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-base uppercase text-foreground tracking-wider mb-4">
          About Us
        </h2>
        <p className="text-3xl md:text-4xl font-bold tracking-tighter max-w-2xl mx-auto">
          Building Trust in the{" "}
          <span className="bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
            Pharmaceutical Supply Chain
          </span>
        </p>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-base leading-relaxed">
          PharmaChain leverages blockchain technology to create an unbreakable
          chain of trust — ensuring every medication that reaches a patient is
          authentic, safe, and fully traceable.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="text-center p-6 rounded-xl border border-accent bg-muted/30"
          >
            <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {values.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="group p-6 rounded-xl border border-accent bg-background hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

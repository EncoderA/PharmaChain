import { Mail, MapPin, Phone, Clock } from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    detail: "support@pharmachain.io",
    subDetail: "We reply within 24 hours",
  },
  {
    icon: Phone,
    title: "Call Us",
    detail: "+91 123-4567",
    subDetail: "Mon-Fri, 9 AM – 6 PM EST",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    detail: "123 Blockchain Pharma",
    subDetail: "India, 94102",
  },
  {
    icon: Clock,
    title: "Business Hours",
    detail: "Monday – Friday",
    subDetail: "9:00 AM – 6:00 PM IST",
  },
];

export function Contact() {
  return (
    <div className="py-20 px-8">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-base uppercase text-foreground tracking-wider mb-4">
          Contact Us
        </h2>
        <p className="text-3xl md:text-4xl font-bold tracking-tighter max-w-2xl mx-auto">
          Get in{" "}
          <span className="bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
            Touch With Us
          </span>
        </p>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-base leading-relaxed">
          Have questions about PharmaChain? We&apos;d love to hear from you.
          Reach out and our team will get back to you promptly.
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {contactInfo.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="group p-5 rounded-xl border border-accent bg-background hover:border-primary/50 transition-all duration-300"
            >
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit mb-3 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1">
                {item.title}
              </h4>
              <p className="text-sm text-foreground">{item.detail}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.subDetail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}


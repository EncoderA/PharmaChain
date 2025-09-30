import {
  EyeOpenIcon,
  GlobeIcon,
  CheckCircledIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { BentoCard, BentoGrid } from "../ui/bento-grid";
import { ShieldIcon } from "lucide-react";
import SecurityBento from "./SecrityBento";
import TrackBento from "./TrackBento";
import Transparency from "./Transparency";

const features = [
  {
    Icon: ShieldIcon ,
    name: "Advanced Security",
    description:
      "Military-grade encryption protects every transaction and data point in the supply chain.",
    // href: "/",
    // cta: "Learn more",
    background: (
      <SecurityBento />
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: EyeOpenIcon,
    name: "Full Transparency",
    description:
      "Complete visibility into every step of the pharmaceutical journey.",
    // href: "/",
    // cta: "Learn more",
    background: (
      <Transparency />
    ),
    className: " lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: GlobeIcon,
    name: "Blockchain Network",
    description:
      "Immutable ledger technology ensures data integrity and authenticity.",
    // href: "/",
    // cta: "Learn more",
    background: (
      <div className="absolute inset-0 bg-background" />
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: CheckCircledIcon,
    name: "Trust Verification",
    description:
      "Multi-layer authentication validates every participant and transaction.",
    // href: "/",
    // cta: "Learn more",
    background: (
      <div className="absolute inset-0 bg-background" />
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: MagnifyingGlassIcon,
    name: "Track & Trace",
    description:
      "Real-time monitoring and complete traceability from manufacturer to patient.",
    // href: "/",
    // cta: "Learn more",
    background: (
      <TrackBento  />
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

export function Features() {
  return (
    <div className="">
      <div className="text-center py-10">
        <h2 className="text-base uppercase text-foreground">   
            Key Features
        </h2>
      </div>
      <BentoGrid className="lg:grid-rows-3">
        {features.map((feature) => (
          <BentoCard key={feature.name} {...feature} />
        ))}
      </BentoGrid>
    </div>
  );
}

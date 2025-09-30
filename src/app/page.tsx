import { CTA } from "@/components/landingpage/CTA";
import Demo from "@/components/landingpage/demo";
import { FAQ } from "@/components/landingpage/FAQ";
import { Features } from "@/components/landingpage/Features";
import Flow from "@/components/landingpage/Flow";
import Footer  from "@/components/landingpage/Footer";
import { Header } from "@/components/landingpage/Header";
import HeroSection from "@/components/landingpage/HeroSection";
import { Section } from "@/components/ui/Section";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative z-50 mx-auto ">
      <Header />
      <div className="min-w-full mx-auto border-t border-accent absolute top-20" />

      <Section isFirst>
        <HeroSection />
      </Section>

      <Section>
        <Demo />
      </Section>

      <Section>
        <Features />
      </Section>

      <Section>
        <Flow />
      </Section>

      <Section>
        <FAQ />
      </Section>

      <Section>
        <CTA />
      </Section>
      <div className="w-screen border-t mx-auto border-accent" />
      <Footer />
    </div>
  );
}

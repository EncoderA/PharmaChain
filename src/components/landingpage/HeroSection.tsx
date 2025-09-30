import React from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarBorder from "../ui/StarBorder";

const HeroSection = () => {
  return (
    <div className="min-h-[570px] flex items-center justify-center">
      <div
        className="absolute inset-0 z-0
          [background-image:linear-gradient(to_right,rgba(34,197,94,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,197,94,0.4)_1px,transparent_1px)]
          dark:[background-image:linear-gradient(to_right,rgba(34,197,94,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,197,94,0.15)_1px,transparent_1px)]"
        style={{
          backgroundSize: "32px 32px",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)",
          maskImage:
            "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)",
        }}
      />

      <div className=" z-10 max-w-7xl mx-auto text-center space-y-8">
        <StarBorder
          as="button"
          className="custom-class p-0 text-sm  bg-secondary shadow-md "
          color="green"
          speed="5s"
        >
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            <span className="text-sm">Blockchain-Powered Security</span>
          </div>
        </StarBorder>
        {/* Main Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-medium text-foreground tracking-tighter">
            Secure Pharmaceutical
            <span className="block bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent tracking-tighter">
              Supply Chain
            </span>
          </h1>
          <p className="text-xl md:text-xl text-muted-foreground max-w-xl mx-auto tracking-tighter">
            Ensure every
            medication is authentic, traceable, and safe from manufacturer to
            patient.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="default"
            className="bg-primary cursor-pointer text-foreground rounded-lg hover:scale-102 text-base border border-gray-500 dark:border:gray-100"
          >
            Start Tracking
            {/* <Link className="w-5 h-5 ml-2" /> */}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

"use client";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ = () => {
  return (
    <div className="flex flex-col gap-4 w-full h-full  ">
      <div className="flex juustify-center items-center flex-col border-b p-10 text-center gap-2">
        <span className="text-primary font-bold">FAQs</span>
        <div className="flex flex-col gap-6">
          <span className="text-4xl tracking-tighter">
            Frequently Asked Questions
          </span>
          <span className="max-w-lg tracking-tighter">
            Find all your doubts and questions in one place. Still couldn&apos;t
            find what you&apos;re looking for?
          </span>
        </div>
      </div>
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="item-1" className="px-4 py-2">
          <AccordionTrigger>
            How does blockchain prevent drug counterfeiting?
          </AccordionTrigger>
          <AccordionContent>
            Our blockchain creates an immutable record of each drug&apos;s journey from
            manufacturer to patient. Every transaction, transfer, and verification
            is permanently recorded, making it impossible to introduce counterfeit
            drugs without detection. Smart contracts automatically validate
            authenticity at each checkpoint.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="px-4 py-2">
          <AccordionTrigger>Can patients verify their medications?</AccordionTrigger>
          <AccordionContent>
            Yes. Patients can scan the QR code on their medication packaging using
            our mobile app to instantly verify authenticity, check expiration
            dates, view the complete supply chain history, and receive alerts
            about any recalls or safety concerns.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3" className="px-4 py-2">
          <AccordionTrigger>
            Is the system compliant with FDA regulations?
          </AccordionTrigger>
          <AccordionContent>
            Absolutely. Our platform is designed to meet FDA Drug Supply Chain
            Security Act (DSCSA) requirements and other international regulatory
            standards. Smart contracts automatically enforce compliance rules,
            generate audit trails, and facilitate regulatory reporting.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4" className="px-4 py-2">
          <AccordionTrigger>How does real-time tracking work?</AccordionTrigger>
          <AccordionContent>
            IoT sensors and GPS tracking devices monitor temperature, location,
            and handling conditions throughout the supply chain. This data is
            automatically recorded on the blockchain, providing real-time visibility
            and ensuring cold-chain compliance for temperature-sensitive
            medications.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5" className="px-4 py-2">
          <AccordionTrigger>
            What happens if counterfeit drugs are detected?
          </AccordionTrigger>
          <AccordionContent>
            Our AI algorithms continuously monitor blockchain data for suspicious
            patterns. When potential counterfeits are detected, the system
            immediately alerts all stakeholders, triggers automatic quarantine
            protocols, and notifies regulatory authorities to prevent distribution.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6" className="px-4 py-2">
          <AccordionTrigger>How secure is patient data in the system?</AccordionTrigger>
          <AccordionContent>
            All patient data is encrypted and stored off-chain with only
            authorized healthcare providers having access. The blockchain only
            contains drug authenticity and supply chain data, never personal
            medical information, ensuring full HIPAA compliance.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-7" className="px-4 py-2">
          <AccordionTrigger>
            Can the system integrate with existing pharmacy systems?
          </AccordionTrigger>
          <AccordionContent>
            Yes. Our platform offers APIs and SDKs that seamlessly integrate with
            existing ERP systems, pharmacy management software, and hospital
            information systems. Implementation requires minimal changes to
            current workflows.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-8" className="px-4 py-2">
          <AccordionTrigger>
            What are the costs for implementing this system?
          </AccordionTrigger>
          <AccordionContent>
            Implementation costs vary based on organization size and requirements.
            However, the system typically pays for itself through reduced
            counterfeit losses, improved compliance efficiency, and enhanced
            patient safety. We offer flexible pricing models for different
            stakeholders.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
  
    </div>
  );
};

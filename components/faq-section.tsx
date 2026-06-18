'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FAQItem = {
  title: string;
  description: string;
};

type FAQSectionProps = {
  items: FAQItem[];
};

export function FAQSection({ items }: FAQSectionProps) {
  return (
    <>
      <Accordion type="single" collapsible className="space-y-4">
        {items.map((item, index) => (
          <AccordionItem key={`${item.title}-${index}`} value={`item-${index}`} className="bg-card rounded-lg px-6 border-2">
            <AccordionTrigger className="text-left font-semibold hover:text-primary">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.description}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map((item) => ({
              '@type': 'Question',
              name: item.title,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.description,
              },
            })),
          }),
        }}
      />
    </>
  );
}





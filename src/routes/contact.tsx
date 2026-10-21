import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PageHeader } from "@/components/page";
import { CONTACT_EMAIL } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => seo("Contact — CreatorKit Studio", "Get in touch with the CreatorKit Studio team with questions, feedback or tool suggestions."),
  component: Page,
});

function Page() {
  return (
    <main>
      <PageHeader eyebrow="Contact" title="Get in touch" intro="Questions, feedback or an idea for a new tool? We'd love to hear from you." />
      <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6">
        <div className="card-surface p-6">
          {CONTACT_EMAIL ? (
            <p>
              Email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-primary underline-offset-4 hover:underline">{CONTACT_EMAIL}</a>. We aim to reply within a few business days.
            </p>
          ) : (
            <p className="text-muted-foreground">Our support inbox is being set up. Please check back soon.</p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">Please don't send passwords or sensitive personal information by email.</p>
        </div>
      </div>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import trainingImg from "@/assets/training.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the K2 Coaches" },
      {
        name: "description",
        content:
          "Meet the coaches behind K2 — including a two-time GMC Coach of the Year and a current high school varsity coach.",
      },
      { property: "og:title", content: "About the K2 Coaches" },
      {
        property: "og:description",
        content: "Award-winning high school coaches leading a four-day camp in North Jersey.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="wrap grid gap-12 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-7">
            <p className="eyebrow">About</p>
            <h1 className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl text-balance">
              Coached by people who do this{" "}
              <span className="italic text-pitch">every day</span>.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-muted-foreground text-pretty">
              Our coaches don't show up for a week and disappear. They lead high
              school programs, develop players year-round, and bring the same care,
              commitment, and passion you would want from your daughter's coach.
            </p>
          </div>
          <div className="md:col-span-5">
            <img
              src={trainingImg}
              alt="Soccer training session"
              width={1280}
              height={1600}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-sm object-cover"
            />
          </div>
        </div>
      </section>

      <section className="wrap py-24 md:py-32">
        <div className="grid gap-16 md:grid-cols-2">
          {/* Coach 1 */}
          <article className="group">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-sm bg-muted">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-foreground to-foreground/70 p-8 text-center text-background">
                <div>
                  <p className="eyebrow text-background/60">Coach Kim Hopping</p>
                  <p className="mt-4 font-display text-5xl italic text-pitch">01</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <p className="eyebrow">Coach Kim Hopping</p>
              <h2 className="mt-2 font-display text-3xl">Varsity Coach, Old Bridge Girls Soccer</h2>
              <ul className="mt-6 space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pitch" />
                  Two-time Coach of the Year
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pitch" />
                  GMC Champion
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pitch" />
                  Coaching since 2009
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pitch" />
                  High school varsity, year-round
                </li>
              </ul>
            </div>
          </article>

          {/* Coach 2 */}
          <article className="group">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-sm bg-muted">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pitch to-pitch/70 p-8 text-center text-pitch-foreground">
                <div>
                  <p className="eyebrow text-pitch-foreground/70">Coach Kurt Eisinger</p>
                  <p className="mt-4 font-display text-5xl italic">02</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <p className="eyebrow">Coach Kurt Eisinger</p>
              <h2 className="mt-2 font-display text-3xl">High School Soccer Coach</h2>
              <p className="mt-6 text-muted-foreground">
                Full bio coming soon. A current high school soccer coach bringing
                additional experience, perspective, and small-group attention to
                every camp session.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="border-t border-border bg-foreground py-24 text-background md:py-32">
        <div className="wrap max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-pitch">
            What to expect
          </p>
          <h2 className="mt-6 font-display text-4xl leading-tight md:text-5xl text-balance">
            Small groups. Real coaching.{" "}
            <span className="italic text-pitch">No filler.</span>
          </h2>
          <p className="mt-6 text-background/70 text-pretty">
            We cap enrollment so every player gets seen. Bring water, cleats,
            shin guards, and the willingness to compete. We'll handle the rest.
          </p>
          <Link
            to="/register"
            className="mt-10 inline-flex h-12 items-center rounded-full bg-pitch px-6 text-sm font-medium text-pitch-foreground"
          >
            Reserve a spot
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

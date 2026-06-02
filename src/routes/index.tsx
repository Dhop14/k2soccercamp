import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import ballImg from "@/assets/ball.jpg";
import trainingImg from "@/assets/training.jpg";
import { SiteLayout } from "@/components/site/Layout";
import { CAMP_REGION, CAMP_VENUE_SHORT } from "../lib/camp";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "K2 Soccer Camp — July in Morris County" },
      {
        name: "description",
        content:
          "A four-day summer soccer camp for girls 3rd through 8th grade in Morris County, NJ. Venue to be announced. Led by award-winning high school coaches. $225 per player.",
      },
      { property: "og:title", content: "K2" },
      {
        property: "og:description",
        content:
          "Four focused days. All skill levels. Led by award-winning high school coaches in New Jersey.",
      },
    ],
  }),
  component: Index,
});

const tickerItems = [
  "Girls 3rd–8th grade",
  CAMP_REGION,
  CAMP_VENUE_SHORT,
  "Four Days in July",
  "All Skill Levels",
  "$225 per Player",
  "Veteran Coaches",
];

function Index() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-x-clip border-b border-border">
        <div className="wrap grid gap-12 py-12 md:grid-cols-12 md:gap-8 md:py-20">
          <div className="md:col-span-7">
            <div className="animate-fade-up">
              <div className="flex flex-wrap items-center gap-3">
                <p className="eyebrow">North Jersey · July 13th–16th, 2026</p>
                <span className="inline-flex items-center gap-2 rounded-full bg-pitch/10 px-3 py-1 text-xs font-medium text-pitch">
                  <span className="h-1.5 w-1.5 rounded-full bg-pitch" />
                  Registration open
                </span>
              </div>
              <h1 className="mt-6 font-display text-[clamp(2.75rem,7vw,6rem)] leading-[0.95] tracking-tight text-balance">
                Four days.<br />
                One <em className="text-pitch not-italic">goal</em>.<br />
                Elevate your game.
              </h1>
              <p className="mt-8 max-w-xl text-lg text-muted-foreground text-pretty">
                A focused summer camp for girls 3rd through 8th grade in the{" "}
                {CAMP_REGION} area. Built around real coaching, real reps, and a real love of the game.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
                >
                  Reserve a spot
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-border px-6 text-sm font-medium hover:border-foreground"
                >
                  Meet the coaches
                </Link>
              </div>

              <dl className="hero-stats mt-12 flex flex-wrap gap-x-10 gap-y-6 border-t border-border pt-8 sm:gap-x-12">
                <div>
                  <dt className="eyebrow">Grades</dt>
                  <dd className="type-display-sm mt-2">3–8</dd>
                </div>
                <div>
                  <dt className="eyebrow">Days</dt>
                  <dd className="type-display-sm mt-2">July 13th – 16th</dd>
                </div>
                <div>
                  <dt className="eyebrow">Tuition</dt>
                  <dd className="type-display-sm mt-2">$225</dd>
                </div>
                <div>
                  <dt className="eyebrow">Location</dt>
                  <dd className="type-display-sm mt-2">{CAMP_VENUE_SHORT}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="relative md:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-muted">
              <img
                src={heroImg}
                alt="A young soccer player on a sunlit field at golden hour"
                width={1920}
                height={1280}
                className="h-full w-full object-cover object-[25%_center]"
              />

            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="ticker-bar relative border-y border-border bg-foreground text-background">
          <div className="ticker-bar__track type-display-sm flex animate-marquee gap-12 whitespace-nowrap">
            {[...tickerItems, ...tickerItems].map((t, i) => (
              <span key={i} className="flex items-center gap-12">
                {t}
                <span className="h-1.5 w-1.5 rounded-full bg-pitch" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="wrap py-24 md:py-32">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow">01 — Philosophy</p>
          </div>
          <div className="md:col-span-8">
            <h2 className="font-display text-4xl leading-tight md:text-6xl text-balance">
              We don't run drills. We{" "}
              <span className="italic text-pitch">build players</span>.
            </h2>
            <p className="mt-8 max-w-2xl text-lg text-muted-foreground text-pretty">
              Every session is designed by working high school coaches who know
              what the next level looks like. Small groups, honest feedback, and
              real game situations — every single day.
            </p>

            <div className="mt-16 grid gap-12 sm:grid-cols-2">
              {[
                {
                  n: "Technique",
                  body: "First touch, passing weight, finishing under pressure. The fundamentals that travel with you.",
                },
                {
                  n: "Tactics",
                  body: "Reading space, defensive shape, and decision-making at game speed.",
                },
                {
                  n: "Mentality",
                  body: "Compete hard, support your teammates, and play with joy.",
                },
                {
                  n: "Confidence",
                  body: "Leave with a clearer picture of what you do well — and what to work on next.",
                },
              ].map((p, i) => (
                <div key={p.n} className="border-t border-border pt-6">
                  <p className="eyebrow">0{i + 1}</p>
                  <h3 className="mt-2 font-display text-2xl">{p.n}</h3>
                  <p className="mt-3 text-muted-foreground">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SPLIT IMAGE BLOCK */}
      <section className="bg-foreground text-background">
        <div className="wrap grid gap-12 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-6">
            <img
              src={trainingImg}
              alt="Young female soccer players training"
              width={1280}
              height={1600}
              loading="lazy"
              className="h-full w-full rounded-sm object-cover"
            />
          </div>
          <div className="md:col-span-6 md:pl-8">
            <p className="eyebrow !text-pitch">02 — The week</p>
            <h2 className="mt-6 font-display text-4xl leading-tight md:text-5xl text-balance">
              Four days that don't waste a minute.
            </h2>
            <ol className="mt-12 space-y-8">
              {[
                ["Day 1", "Foundations", "Touch, turns, passing under light pressure. Setting the standard."],
                ["Day 2", "1v1 & Decisions", "Attacking and defending duels. Reading the moment."],
                ["Day 3", "Small Sides", "3v3 and 4v4 — where players actually grow."],
                ["Day 4", "Game Day", "Full-sided scrimmages, awards, and a chance to put it all together."],
              ].map(([day, title, body]) => (
                <li key={day} className="grid grid-cols-12 gap-4 border-t border-background/15 pt-6">
                  <div className="col-span-3 font-display italic text-pitch">{day}</div>
                  <div className="col-span-9">
                    <h3 className="font-display text-2xl">{title}</h3>
                    <p className="mt-2 text-background/70">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="wrap py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow">03 — Join</p>
            <h2 className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl text-balance">
              Spots are <span className="italic text-pitch">limited</span> on purpose.
            </h2>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              We keep groups small so every player gets real coaching attention.
              Reserve your spot before the week fills up.
            </p>
            <Link
              to="/register"
              className="mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-pitch px-6 text-sm font-medium text-pitch-foreground transition-transform hover:scale-[1.02]"
            >
              Register your player
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="md:col-span-5">
            <img
              src={ballImg}
              alt="Soccer ball resting on fresh grass"
              width={1280}
              height={896}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-sm object-cover"
            />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

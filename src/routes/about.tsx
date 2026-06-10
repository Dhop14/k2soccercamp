import { createFileRoute } from "@tanstack/react-router";
import { RegistrationCta } from "@/components/registration/RegistrationCta";
import { SiteLayout } from "@/components/site/Layout";
import { useRegistrationStatus } from "@/hooks/use-registration-status";
import trainingImg from "@/assets/training.jpg";
import kimImg from "@/assets/kim.jpg";
import kurtImg from "@/assets/kurt.jpg";

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
  const registration = useRegistrationStatus();

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
              <img
                src={kimImg}
                alt="Coach Kim Hopping"
                width={1280}
                height={1600}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-6">
              <p className="eyebrow">Coach Kim Hopping</p>
              <h2 className="mt-2 font-display text-3xl">Head Coach, OBHS Girls Soccer</h2>
              <ul className="mt-6 space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pitch" />
                  Head Coach, Old Bridge High School Girls Soccer
                </li>
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
                  17+ years of coaching experience
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pitch" />
                  US Soccer Licensed Coach
                </li>
              </ul>
              <p className="mt-6 text-muted-foreground text-pretty">
                Coach Kim has built a winning culture through technical detail,
                disciplined team play, and player first leadership. Her sessions
                are high-energy, purposeful, and designed to help girls develop
                confidence, decision-making, and game-ready habits that carry into
                every season.
              </p>
            </div>
          </article>

          {/* Coach 2 */}
          <article className="group">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-sm bg-muted">
              <img
                src={kurtImg}
                alt="Coach Kurt Eisinger"
                width={1280}
                height={1600}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-6">
              <p className="eyebrow">Coach Kurt Eisinger</p>
              <h2 className="mt-2 font-display text-3xl">Varsity Assistant Coach, Morris Hills Girls Soccer</h2>
              <ul className="mt-6 space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pitch" />
                  Varsity Assistant Coach, Morris Hills Girls Soccer
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pitch" />
                  12 years coaching experience at the youth and high school girls level
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pitch" />
                  26 years of referee experience
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pitch" />
                  Currently coaching multiple teams in Denville and Rockaway, including
                  Denville U16 Girls Flight 1
                </li>
              </ul>
              <p className="mt-6 text-muted-foreground text-pretty">
                Coach Kurt brings a rare blend of sideline leadership and game-level
                perspective. From varsity girls soccer to top youth competition, he helps
                players build confidence, sharpen decision making, and compete with purpose.
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
          <RegistrationCta
            open={registration.open}
            variant="pitch"
            className="mt-10"
          />
        </div>
      </section>
    </SiteLayout>
  );
}





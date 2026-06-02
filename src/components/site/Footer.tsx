import { Link } from "@tanstack/react-router";

import { SiteBrand } from "@/components/site/SiteBrand";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border bg-background">
      <div className="wrap py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <SiteBrand logoTitle="Soccer Camp" />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Four days of focused training for girls 3rd–8th grade. Morris County, New Jersey.
            </p>
          </div>

          <div>
            <p className="eyebrow">Site</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/" className="hover:text-pitch">Home</Link></li>
              <li><Link to="/about" className="hover:text-pitch">About K2</Link></li>
              <li><Link to="/register" className="hover:text-pitch">Register</Link></li>
              <li><Link to="/contact" className="hover:text-pitch">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow">Camp</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>July 13th - 16th, 2026 · 4 days</li>
              <li>Morris County, NJ</li>
              <li>Girls, 3rd–8th grade</li>
              <li>All Skill Levels welcome</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} K2 Soccer Camp. All rights reserved.</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link to="/waiver" className="hover:text-pitch">
              Waiver
            </Link>
            <Link to="/health-emergency" className="hover:text-pitch">
              Health & Emergency
            </Link>
            <Link to="/privacy" className="hover:text-pitch">
              Privacy
            </Link>
            <span>Built with care in New Jersey.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

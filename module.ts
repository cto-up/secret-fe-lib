import type { HubModule } from "core-fe-lib/components-shadcn/shell/types";
import { secretRoutes } from "./routes";
import { getSecretLinks } from "./links";
import enUS from "./i18n/en-US";
import fr from "./i18n/fr";
import es from "./i18n/es";
import it from "./i18n/it";
import de from "./i18n/de";
import pt from "./i18n/pt";

export interface SecretModuleOptions {
  requiredFeature?: string;
  adminOnly?: boolean;
  landingPath?: string;
  landingPriority?: number;
  navIcon?: string;
}

export function createSecretModule(opts: SecretModuleOptions = {}): HubModule {
  return {
    id: "secret",
    name: "Secret",
    adminOnly: opts.adminOnly ?? true,
    requiredFeature: opts.requiredFeature,
    landingPath: opts.landingPath,
    landingPriority: opts.landingPriority,
    routes: (layouts) => secretRoutes(layouts.MainLayout),
    navLinks: (ctx) => getSecretLinks(ctx.t, opts.navIcon ?? "lock"),
    messages: { "en-US": enUS, fr, es, it, de, pt },
  };
}

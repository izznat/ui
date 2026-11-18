import * as Alchemy from "alchemy";
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "Dashboard",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const client = yield* Cloudflare.Website.Vite("Client");

    return {
      client: client.url,
    };
  }),
);

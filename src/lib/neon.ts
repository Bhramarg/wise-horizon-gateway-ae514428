import { createClient } from '@neondatabase/neon-js';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters';

export const neon = createClient({
  auth: {
    url: "https://ep-cold-frost-a7d30q9e.neonauth.ap-southeast-2.aws.neon.tech/neondb/auth",
    adapter: BetterAuthReactAdapter(),
  },
});

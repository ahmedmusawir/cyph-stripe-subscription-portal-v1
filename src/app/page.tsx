import { redirect } from "next/navigation";

// / rehomes to /dashboard. Lives at the app root so no layout chrome or
// loading.tsx boundary can paint before the redirect: Next emits a true
// HTTP 307, zero flash. Anonymous visitors bounce /dashboard → /login via
// the (portal) layout gate (no auth logic here). A public landing page, if the
// FFM wants one, replaces this redirect.
export const dynamic = "force-dynamic";

const Home = () => {
  redirect("/dashboard");
};

export default Home;

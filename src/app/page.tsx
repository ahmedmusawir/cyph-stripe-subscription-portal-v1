import { redirect } from "next/navigation";

// / rehomes to the PUBLIC plan-selection screen (RULINGS R-009): prospective
// subscribers arrive from marketing and need no login. Replaces the interim
// foundation redirect to /dashboard. Lives at the app root so no layout chrome
// or loading.tsx boundary can paint before the redirect: Next emits a true
// HTTP 307, zero flash.
export const dynamic = "force-dynamic";

const Home = () => {
  redirect("/demo/register/plan");
};

export default Home;

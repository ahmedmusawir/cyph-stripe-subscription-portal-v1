import { redirect } from "next/navigation";

// The simulated customer sign-in screen is retired (RULINGS R-009): the real
// /login carries the designed sign-in presentation.
export const dynamic = "force-dynamic";

export default function DemoSignIn() {
  redirect("/login");
}

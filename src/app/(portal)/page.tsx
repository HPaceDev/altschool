import { redirect } from "next/navigation";

/** Корень портала — сразу прототип: ради него сюда и заходят. */
export default function Home() {
  redirect("/prototype");
}

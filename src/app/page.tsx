import { BODY_HTML } from "./markup";
import GrillClient from "./GrillClient";

// The page markup is server-rendered verbatim (so crawlers + no-JS visitors
// get the full chalkboard), and GrillClient attaches the interactive behaviour
// (countdown, status, gauge, calendar, subscribe form) + privacy-gated
// analytics after mount.
export default function Page() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
      <GrillClient />
    </>
  );
}

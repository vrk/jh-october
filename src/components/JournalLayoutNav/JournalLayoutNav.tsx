import * as React from "react";
import Button from "@/components/Button";
import NavBar from "../NavBar";

type Props = {
  journalId: string;
};
function JournalLayoutNav({ journalId }: React.PropsWithoutRef<Props>) {
  return (
    <NavBar>
      <Button key={journalId} href={`/print/${journalId}`}>
        Ready to print
      </Button>
    </NavBar>
  );
}

export default JournalLayoutNav;

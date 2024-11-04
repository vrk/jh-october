import * as React from "react";
import Button from "@/components/Button";
import NavBar from "../NavBar";

type Props = {
  journalId: string;
};
function PrintLayoutNav({ journalId }: React.PropsWithoutRef<Props>) {
  return (
    <NavBar>
      <Button key={journalId} href={`/journals/${journalId}`}>
        Back to spread
      </Button>
    </NavBar>
  );
}

export default PrintLayoutNav;

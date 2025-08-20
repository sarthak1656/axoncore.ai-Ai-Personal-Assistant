import React from "react";
import Provider from "./Provider";

function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider>
      <div className="h-screen overflow-hidden bg-white">{children}</div>
    </Provider>
  );
}

export default WorkspaceLayout;

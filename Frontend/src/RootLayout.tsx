import { Outlet } from "@tanstack/react-router";

import Navbar from "./components/NavBar";

export default function RootLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

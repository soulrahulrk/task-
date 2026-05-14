"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="btn btn-danger"
      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
    >
      Logout
    </button>
  );
}

// src/middleware.ts
import withAuth from "next-auth/middleware";

// Exportamos explícitamente la función por defecto que Next.js espera
export default withAuth;

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
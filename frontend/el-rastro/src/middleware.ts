export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/user/profile",
    "/user/settings/change-location",
    "/user/settings/change-name",
    "/user/settings/new-photo",
    "/chat",
  ],
};

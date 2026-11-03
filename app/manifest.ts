import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ARASCO — Personal Intelligence",
    short_name: "ARASCO",
    description: "Your personal AI command center.",
    start_url: "/arasco",
    display: "standalone",
    background_color: "#070b12",
    theme_color: "#070b12",
    orientation: "portrait",
  };
}

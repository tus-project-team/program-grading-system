import starlight from "@astrojs/starlight-tailwind"
import { withTV } from "tailwind-variants/transformer"
import animate from "tailwindcss-animate"
import reactAria from "tailwindcss-react-aria-components"
import colors from "tailwindcss/colors"

export default withTV({
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: ["class"],
  plugins: [starlight(), animate, reactAria],
  theme: {
    extend: {
      borderRadius: {
        "2xl": "calc(var(--radius) + 5px)",
        "3xl": "calc(var(--radius) + 7.5px)",
        lg: "calc(var(--radius))",
        md: "calc(var(--radius) - 2.5px)",
        sm: "calc(var(--radius) - 5px)",
        xl: "calc(var(--radius) + 2.5px)",
      },
      colors: {
        accent: {
          ...colors.zinc,
          DEFAULT: "hsl(var(--accent))",
          fg: "hsl(var(--accent-fg))",
          subtle: "hsl(var(--accent-subtle))",
          "subtle-fg": "hsl(var(--accent-subtle-fg))",
        },
        bg: "hsl(var(--bg))",
        border: "hsl(var(--border))",
        danger: {
          DEFAULT: "hsl(var(--danger))",
          fg: "hsl(var(--danger-fg))",
        },
        dark: "hsl(var(--dark))",
        fg: "hsl(var(--fg))",
        gray: colors.zinc,
        info: {
          DEFAULT: "hsl(var(--info))",
          fg: "hsl(var(--info-fg))",
        },
        input: "hsl(var(--input))",
        light: "hsl(var(--light))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          fg: "hsl(var(--muted-fg))",
        },
        overlay: {
          DEFAULT: "hsl(var(--overlay))",
          fg: "hsl(var(--overlay-fg))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          fg: "hsl(var(--primary-fg))",
        },
        ring: "hsl(var(--ring))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          fg: "hsl(var(--secondary-fg))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          fg: "hsl(var(--success-fg))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          fg: "hsl(var(--tertiary-fg))",
        },
        toggle: "hsl(var(--toggle))",
        warning: {
          DEFAULT: "hsl(var(--warning))",
          fg: "hsl(var(--warning-fg))",
        },
      },
    },
  },
})

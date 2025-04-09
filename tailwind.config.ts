import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
    },
    extend: {
      fontSize: {
        'heading': '48px',
        'subheading': '20px',
        'body': '16px',
        'label': '14px',
      },
      fontWeight: {
        'heading': '700',
        'subheading': '500',
        'body': '400',
        'label': '500',
      },
      lineHeight: {
        'default': '1.6',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          blue: {
            DEFAULT: "#2563EB",
            dark: "#1E40AF",
            light: "#3B82F6",
            ultraLight: "#93C5FD",
          }
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          orange: "#F59E0B",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          red: "#EF4444",
        },
        text: {
          primary: "#1D1D1F",
          secondary: "#6B7280",
          light: "#FFFFFF",
        },
        bg: {
          primary: "#FFFFFF",
          secondary: "#F3F4F6",
          dark: "#1D1D1F",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        status: {
          active: "#22C55E",
          landed: "#3B82F6",
          scheduled: "#F59E0B",
          delayed: "#EF4444",
          cancelled: "#EF4444",
          diverted: "#8B5CF6",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      boxShadow: {
        'glowSmall': '0 0 8px rgba(37, 99, 235, 0.3)',
        'glowMedium': '0 0 15px rgba(37, 99, 235, 0.5)',
        'glowLarge': '0 0 25px rgba(37, 99, 235, 0.7)',
        'buttonHover': '0 0 8px rgba(245, 158, 11, 0.5)',
        'cardHover': '0 0 12px rgba(37, 99, 235, 0.2)',
        'flightPath': '0 0 0 2px rgba(37, 99, 235, 0.25), 0 0 10px rgba(37, 99, 235, 0.3)',
        'runwayLight': '0 0 5px rgba(147, 197, 253, 0.7), 0 0 15px rgba(37, 99, 235, 0.5)',
      },
      backdropBlur: {
        'frosted': '12px',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale": {
          from: { transform: "scale(0.9)" },
          to: { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce": "bounce 0.8s ease-in-out",
        "fade-in": "fade-in 0.5s ease-in-out",
        "slide-in": "slide-in 0.3s ease-in-out",
        "scale": "scale 0.3s ease-in-out",
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1E40AF, #2563EB)',
        'gradient-accent': 'linear-gradient(to right, #2563EB, #60A5FA)',
        'gradient-light': 'linear-gradient(135deg, #2563EB, #93C5FD)',
        'gradient-horizon': 'linear-gradient(to bottom, #1E40AF 0%, #2563EB 45%, #93C5FD 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

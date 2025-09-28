import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				medical: {
					blue: 'hsl(var(--medical-blue))',
					'blue-light': 'hsl(var(--medical-blue-light))',
					'blue-dark': 'hsl(var(--medical-blue-dark))',
					teal: 'hsl(var(--medical-teal))',
					green: 'hsl(var(--medical-green))',
					'green-light': 'hsl(var(--medical-green-light))',
					orange: 'hsl(var(--medical-orange))',
					red: 'hsl(var(--medical-red))'
				},
				'progress': {
					bg: 'hsl(var(--progress-bg))',
					complete: 'hsl(var(--progress-complete))',
					partial: 'hsl(var(--progress-partial))',
					incomplete: 'hsl(var(--progress-incomplete))'
				},
				'indicator': {
					normal: 'hsl(var(--normal-indicator))',
					abnormal: 'hsl(var(--abnormal-indicator))',
					pending: 'hsl(var(--pending-indicator))',
					refused: 'hsl(var(--refused-indicator))'
				},
				'case': {
					pip: 'hsl(var(--case-pip))',
					insurance: 'hsl(var(--case-insurance))',
					'slip-fall': 'hsl(var(--case-slip-fall))',
					'workers-comp': 'hsl(var(--case-workers-comp))',
					'cash-plan': 'hsl(var(--case-cash-plan))',
					'attorney-only': 'hsl(var(--case-attorney-only))'
				},
				'medical-blue': 'hsl(var(--medical-blue))',
				'medical-blue-light': 'hsl(var(--medical-blue-light))',
				'medical-blue-dark': 'hsl(var(--medical-blue-dark))',
				'medical-teal': 'hsl(var(--medical-teal))',
				'sidebar-bg': 'hsl(var(--sidebar-bg))',
				'sidebar-text': 'hsl(var(--sidebar-text))',
				'sidebar-hover': 'hsl(var(--sidebar-hover))',
				'sidebar-active': 'hsl(var(--sidebar-active))',
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

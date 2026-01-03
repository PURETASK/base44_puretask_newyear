/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			// PureTask Brand Colors (LOCKED)
  			brand: {
  				primary: '#00FFFF',
  			},
  			
  			// Semantic Colors
  			success: {
  				DEFAULT: '#22C55E',
  				soft: '#ECFDF5',
  				border: '#86EFAC',
  				text: '#166534',
  			},
  			system: {
  				DEFAULT: '#06B6D4',
  				soft: '#ECFEFF',
  				border: '#67E8F9',
  				text: '#164E63',
  			},
  			warning: {
  				DEFAULT: '#F59E0B',
  				soft: '#FFFBEB',
  				border: '#FCD34D',
  				text: '#92400E',
  			},
  			error: {
  				DEFAULT: '#EF4444',
  				soft: '#FEF2F2',
  				border: '#FCA5A5',
  				text: '#991B1B',
  			},
  			info: {
  				DEFAULT: '#3B82F6',
  				soft: '#EFF6FF',
  				border: '#93C5FD',
  				text: '#1E3A8A',
  			},
  			
  			// shadcn/ui compatibility (kept for existing components)
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
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
  		fontFamily: {
  			heading: ['Poppins', 'system-ui', 'sans-serif'],
  			body: ['Quicksand', 'system-ui', 'sans-serif'],
  			mono: ['Fira Code', 'Consolas', 'monospace'],
  		},
  		fontSize: {
  			display: ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
  			'display-sm': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
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
}
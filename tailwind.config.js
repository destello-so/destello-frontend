/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,scss}'],
  theme: {
    extend: {
      colors: {
        // Paleta principal rosa pastel
        primary: {
          50: '#fef7f3',
          100: '#fdf2ec', 
          200: '#f9ddd0',
          300: '#f4c2a7',
          400: '#ff70a6', // tu rosa principal
          500: '#e57657',
          600: '#d15d3f',
          700: '#b04837',
          800: '#8e3e35',
          900: '#73362f',
          DEFAULT: '#ff70a6'
        },
        
        // Rosa suave para backgrounds y elementos delicados  
        rose: {
          50: '#fff1f3',
          100: '#ffe4e8',
          200: '#ffcdd6',
          300: '#ffa0b4',
          400: '#ff70a6',
          500: '#fa3b82',
          600: '#e91e63',
          700: '#c21858',
          800: '#a21851',
          900: '#881a4a'
        },

        // Accent colors complementarios
        accent: {
          50: '#fdf2f8',
          100: '#fce7f3', 
          200: '#fbcfe8',
          300: '#f8a5c2',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          DEFAULT: '#ffd1dc'
        },

        // Tonos neutros cálidos que combinan perfectamente
        warm: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7', 
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b'
        },

        // Background suaves especiales
        cream: '#fef9f3',
        pearl: '#f8f4f0', 
        blush: '#fdf2f8',
        powder: '#f0f8ff'
      },

      // Gradientes hermosos predefinidos
      backgroundImage: {
        'gradient-rose': 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #ff70a6 0%, #ffa0c9 50%, #ffd1dc 100%)',
        'gradient-pearl': 'linear-gradient(135deg, #fef9f3 0%, #f8f4f0 100%)',
        'gradient-soft': 'linear-gradient(45deg, #fdf8f6, #fef7f3)',
        'gradient-glow': 'radial-gradient(circle at center, #fdf2f8 0%, #fce7f3 100%)'
      },

      // Sombras suaves y elegantes
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(255, 112, 166, 0.1), 0 10px 20px -2px rgba(255, 112, 166, 0.04)',
        'rose': '0 4px 25px -5px rgba(255, 112, 166, 0.2), 0 10px 20px -5px rgba(255, 112, 166, 0.1)',
        'blush': '0 8px 30px -5px rgba(253, 231, 243, 0.3)',
        'glow': '0 0 20px rgba(255, 112, 166, 0.3)',
        'card': '0 1px 3px rgba(255, 112, 166, 0.1), 0 1px 2px rgba(255, 112, 166, 0.06)'
      },

      // Borders redondeados hermosos
      borderRadius: {
        'soft': '12px',
        'gentle': '16px', 
        'bubble': '24px',
        'round': '32px'
      },

      // Tipografía mejorada
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'sans-serif']
      },

      // Animaciones suaves
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'float': 'float 3s ease-in-out infinite'
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' }
        },
        bounceSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate')
  ]
} 
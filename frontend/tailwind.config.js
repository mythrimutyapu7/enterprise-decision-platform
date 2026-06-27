export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#050816',
        card: 'rgba(255,255,255,0.06)',
        primary: '#4F8CFF',
        secondary: '#7C5CFF',
        success: '#22C55E',
        warning: '#F59E0B',
        critical: '#EF4444',
        text: '#F8FAFC',
        muted: '#9CA7BA',
      },
      boxShadow: {
        panel: '0 32px 100px rgba(0, 0, 0, 0.38)',
      },
    },
  },
  plugins: [],
};

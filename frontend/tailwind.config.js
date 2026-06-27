export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0F172A',
        card: '#1E293B',
        primary: '#2563EB',
        success: '#22C55E',
        warning: '#F59E0B',
        critical: '#EF4444',
        text: '#F8FAFC',
        muted: '#94A3B8',
      },
      boxShadow: {
        panel: '0 20px 70px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
};

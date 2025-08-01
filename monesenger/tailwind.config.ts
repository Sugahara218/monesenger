import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          '400': '#f59e0b',
          '500': '#d97706',
        },
        slate: colors.slate,
        purple: colors.purple,
        pink: colors.pink,
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#004FA7",
        primaryLight: "#004FA714",
        linkWater: "#F1F6FC",
        outerSpace: '#252828',
        lightBlack: '#000000B2',
        black12opacity: '#0000001F',
        black2opacity: '#00000005',
        black4opacity: '#0000000A',
        black60opacity: "#00000099",
        black50opacity: '#00000080',
        citrineWhite: '#FAF3DA',
        buddhaGold: '#D3A800',
        blackSqueeze: '#E1EBF4',
        blackSqueezeLight: "#F3F7FB",
        pastelGreen: "#6DCF85"
      },
      // fontFamily: {
      //   mundial: ['var(--font-mundial)', 'sans-serif'],
      // },
      fontFamily: {
        'plus-jakarta-sans': ['var(--font-plus-jakarta-sans)'],
      },
    },
  },
  plugins: [],
} satisfies Config;

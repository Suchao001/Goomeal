/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}','./screens/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily : {
        prompt : ['Prompt-Regular'],
        promptBold : ['Prompt-Bold'],
        promptMedium : ['Prompt-Medium'],
        promptLight : ['Prompt-Light'],
        promptSemiBold : ['Prompt-SemiBold'],
      },
      colors: {
        primary: '#ffb800',
      },
    },
  },
  plugins: [],
};

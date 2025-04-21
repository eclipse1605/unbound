
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: '#8c7ee6',
                background: '#212121'
            },
            keyframes: {
                'like-pop': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.25)' },
                    '100%': { transform: 'scale(1.1)' },
                },
                'like-confetti': {
                    '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                    '80%': { opacity: '1' },
                    '100%': { opacity: '0', transform: 'translateY(-16px) scale(1.4)' },
                },
            },
            animation: {
                'like-pop': 'like-pop 0.3s',
                'like-confetti': 'like-confetti 0.6s',
            }
        },
    },
    plugins: [],
};

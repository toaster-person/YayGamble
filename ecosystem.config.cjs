module.exports = {
	apps: [
		{
			name: 'gamble',
			script: './build/index.js',
			interpreter: '/home/blaze/.bun/bin/bun', // insert your own interpreter here
			env: {
				PORT: '5301',
				ORIGIN: 'http://127.0.0.1'
			}
		}
	]
};

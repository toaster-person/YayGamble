module.exports = {
	apps: [
		{
			name: 'gamble',
			script: './build/index.js',
			interpreter: 'bun',
			env: {
				PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`,
				PORT: '5301',
				ORIGIN: 'http://127.0.0.1'
			}
		}
	]
};

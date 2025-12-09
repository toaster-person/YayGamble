module.exports = {
	apps: [
		{
			name: 'gamble',
			script: './build/index.js',
			env: {
				PORT: '5300',
				ORIGIN: 'https://yayblaze.com'
			}
		}
	]
};

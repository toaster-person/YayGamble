export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.m_YevFOH.js",app:"_app/immutable/entry/app.qgxNeoAw.js",imports:["_app/immutable/entry/start.m_YevFOH.js","_app/immutable/chunks/BMWYtcrf.js","_app/immutable/chunks/CnBhPSvY.js","_app/immutable/chunks/D8DXxAzd.js","_app/immutable/chunks/BKyUyGuO.js","_app/immutable/chunks/0VhW8u6o.js","_app/immutable/chunks/D0ZtbyZs.js","_app/immutable/chunks/B3V4Vxzd.js","_app/immutable/entry/app.qgxNeoAw.js","_app/immutable/chunks/D8DXxAzd.js","_app/immutable/chunks/BKyUyGuO.js","_app/immutable/chunks/0VhW8u6o.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/CnBhPSvY.js","_app/immutable/chunks/D0ZtbyZs.js","_app/immutable/chunks/D2XiG5t3.js","_app/immutable/chunks/dlws_A8B.js","_app/immutable/chunks/Dfmw8iVc.js","_app/immutable/chunks/B3V4Vxzd.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/admin",
				pattern: /^\/admin\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/games/blackjack",
				pattern: /^\/games\/blackjack\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/games/slots",
				pattern: /^\/games\/slots\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/home",
				pattern: /^\/home\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/new",
				pattern: /^\/new\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

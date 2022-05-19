/// <reference types="react-scripts" />

declare namespace NodeJS {
	interface ProcessEnv {
		REACT_APP_BACKEND_URL: string;
		REACT_APP_ASSETS: string;
		NODE_ENV: 'development' | 'production' | 'test';
	}
}

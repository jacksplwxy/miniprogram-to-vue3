import {
	createSSRApp
} from "vue";
import App from "./App.vue";
import './app.css'
export function createApp() {
	const app = createSSRApp(App);
	return {
		app,
	};
}

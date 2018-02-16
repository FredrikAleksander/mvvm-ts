export default {
		'Smoke Tests': (browser) => {
				browser
						.url('http://localhost:' + browser.globals.httpPort + '/todo/index.html')
						.waitForElementVisible('a#createTask')
						.end();
		}
};

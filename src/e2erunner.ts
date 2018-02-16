import * as getPort from 'get-port';
import * as http from 'http';
import * as finalhandler from 'finalhandler';
import * as serveStatic from 'serve-static';
import * as childProcess from 'child_process';
import * as nightwatch from 'nightwatch';

const cmdSuffix = process.platform === 'win32' ? '.exe' : '';

function wait(ms: number): Promise<void> {
		return new Promise(function (resolve) {
				setTimeout(resolve.bind(null, undefined), ms)
		});
}

async function startServer(root): Promise<[http.Server, number]> {
		var serve = serveStatic(root);
		var server = http.createServer((req, res) => {
				var done = finalhandler(req, res);
				serve(req, res, done);
		});


		var port = await getPort();
		server.listen(port);
		return [server, port];
}
async function stopServer(server: http.Server): Promise<void> {
		return <any>new Promise((resolve) => server.close(resolve));
}
function runNightwatch([server, port]: [http.Server, number]): Promise<http.Server> {
		return new Promise<http.Server>((resolve, reject) => {
				const argv = {
						config: 'nightwatch.conf.js'
				};
				const settings = {
						globals: {
								httpPort: port,
								waitForConditionTimeout: 500

						}
				};
				const done = () => resolve(server);
				nightwatch.runner(argv, done, settings);
		});
}

startServer('./samples')
		.then(runNightwatch)
		.then(stopServer)
		.catch(reason => console.error(reason));

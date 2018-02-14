import { Container, injectable, inject, ILogger, IPresenter, 
		IRouter, Router, IViewBase, IViewFactory,
		IViewModelFactory } from '../../mvvm/main';
import { HtmlView, HtmlPresenter, WebRouter } from 'mvvm-web';
import { ITodoService } from './services/todo';
import { BrowserTodoService } from './services/BrowserTodoService';
import { viewModels, TodoCreate, TodoDelete, TodoDetails, TodoEdit, TodoList }
		from './viewmodels/viewmodels';
import { views } from './web/views/views';

@injectable()
class ConsoleLogger implements ILogger {
		write(level: number, message: string) {
				console.log(message);
		}
}

function routes(router: IRouter) {
		router
				.map('/Tasks', TodoList)
				.map('/Tasks/{taskId}', TodoDetails)
				.map('/Tasks/{taskId}/Delete', TodoDelete)
				.map('/Tasks/{taskId}/Edit', TodoEdit)
				.map('/NewTask', TodoCreate);
}

new Container()
		.use(viewModels)
		.use(views)
		.registerSingleton([ITodoService, BrowserTodoService], BrowserTodoService)
		.registerSingleton([ILogger, ConsoleLogger], ConsoleLogger)
		.registerSingleton([IRouter, Router, WebRouter], WebRouter)
		.registerInstance([IPresenter, HtmlPresenter], 
				new HtmlPresenter(document.getElementById('viewhost')||document.body))
		.resolve<WebRouter>(WebRouter)
		.use(routes)
		.navigateEntryPoint('/Tasks/');
		

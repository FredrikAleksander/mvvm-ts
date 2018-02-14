import { ITodoService } from '../services/todo';
import { ViewModel, IRouter, property, injectable, inject } from '../../../mvvm/main';

@injectable()
export class TodoDelete extends ViewModel {
		constructor(@inject(IRouter) private router: IRouter,
				@inject(ITodoService) private service: ITodoService) {
				super();
		}

		@property('')
		id: string;

		@property('')
		title: string;

		async init(parameters: {}) {
				if(!('taskId' in parameters)) {
						throw 'missing taskId parameter';
				}
				var task = await this.service.getTask(parameters['taskId']);
				this.id = task.id;
				this.title = task.title;
		}

		async delete() {
				await this.service.deleteTask(this.id);
				await this.router.navigate('/Tasks');
		}
}

import { ITodoService } from '../services/todo';
import { ViewModel, IRouter, injectable, inject, property } from '../../../mvvm/main';

@injectable()
export class TodoEdit extends ViewModel {
		constructor(@inject(IRouter) private router: IRouter,
				@inject(ITodoService) private service: ITodoService) {
				super();
		}

		@property('')
		id: string;

		@property('')
		title: string;

		@property('')
		description: string;

		async init(parameters: {}) {
				if(!('taskId' in parameters)) {
						throw 'missing taskId parameter';
				}
				var task = await this.service.getTask(parameters['taskId']);
				this.id = task.id;
				this.title = task.title;
				this.description = task.description;
		}

		async save() {
				if(this.title.trim().length === 0 ||
						this.description.trim().length === 0)
				{
						return;
				}

				await this.service.updateTask(this.id, this.title, this.description);
				await this.router.navigate('/Tasks');
		}
}

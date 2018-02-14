import { ITodoService } from '../services/todo';
import { ViewModel, property, injectable, inject } from '../../../mvvm/main';

@injectable()
export class TodoDetails extends ViewModel {
		constructor(@inject(ITodoService) private service: ITodoService) {
				super();
		}

		@property('')
		title: string;

		@property('')
		description: string;

		async init(parameters: {}) {
				if(!('taskId' in parameters)) {
						throw 'missing taskId parameter';
				}
				var task = await this.service.getTask(parameters['taskId']);
				this.title = task.title;
				this.description = task.description;

				var self = this;

				setTimeout(() => {
						self.title = 'Noe annet';
				}, 5000);
		}
}

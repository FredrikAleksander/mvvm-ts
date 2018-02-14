import { ViewModel, inject, injectable, property } from '../../../mvvm/main';
import { ITask } from '../models/task';
import { ITodoService } from '../services/todo';

@injectable()
export class TodoList extends ViewModel {
		constructor(@inject(ITodoService) private service: ITodoService)
		{
				super();
		}

		@property([])
		tasks: ITask[];

		async init(parameters: {}) {
				await super.init(parameters);
				this.tasks = await this.service.getTasks();
		}

}

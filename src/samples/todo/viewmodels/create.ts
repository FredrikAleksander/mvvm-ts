import { IRouter, ViewModel, property, injectable, inject } from '../../../mvvm/main';
import { ITodoService } from '../services/todo';

@injectable()
export class TodoCreate extends ViewModel {
		constructor(@inject(IRouter) private router: IRouter, 
				@inject(ITodoService) private service: ITodoService) {
				super();
		}

		@property('')
		title: string;

		@property('')
		description: string;

		async save(): Promise<void> {
				if(this.title.trim().length === 0 && 
						this.description.trim().length === 0) {
						return;
				}

				await this.service.createTask(this.title, this.description);
				await this.router.navigate('/Tasks');
		}
}

import { IViewModelFactory, ViewModelFactory, IContainer } from '../../../mvvm/main';
import { TodoCreate } from './create';
import { TodoDelete } from './delete';
import { TodoDetails } from './details';
import { TodoEdit } from './edit';
import { TodoList } from './list';


export { TodoCreate, TodoDelete, TodoDetails, TodoEdit, TodoList }

export function viewModels(container: IContainer) {
		container.registerInstance([IViewModelFactory, IViewModelFactory], 
				new ViewModelFactory(container)
						.register(TodoCreate, TodoCreate)
						.register(TodoDelete, TodoDelete)
						.register(TodoDetails, TodoDetails)
						.register(TodoEdit, TodoEdit)
						.register(TodoList, TodoList)
		);
}

import { IContainer, IViewFactory } from '../../../../mvvm/main';
import { HtmlViewFactory } from '../../../../mvvm-web/main';
import { TodoCreate, TodoDelete, TodoDetails, TodoEdit, TodoList } 
		from '../../viewmodels/viewmodels';

import { TodoCreateView } from './create';
import { TodoDeleteView } from './delete';
import { TodoDetailsView } from './details';
import { TodoEditView } from './edit';
import { TodoListView } from './list';

export function views(container: IContainer) {
		container.registerInstance([IViewFactory, HtmlViewFactory], 
				new HtmlViewFactory(container)
						.register(TodoCreateView, [TodoCreate], TodoCreateView)
						.register(TodoDeleteView, [TodoDelete], TodoDeleteView)
						.register(TodoDetailsView, [TodoDetails], TodoDetailsView)
						.register(TodoEditView, [TodoEdit], TodoEditView)
						.register(TodoListView, [TodoList], TodoListView)
		);
}

import { TodoList } from '../../viewmodels/list';
import { injectable } from '../../../../mvvm/main';
import { ITask } from '../../models/task';
import { HtmlView, querySelector, binding, trigger } from '../../../../mvvm-web/main';
import template from './templates/list.ejs';

@injectable()
export class TodoListView extends HtmlView<TodoList> {
		template = template;
}

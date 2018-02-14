import { TodoDelete } from '../../viewmodels/delete';
import { injectable } from '../../../../mvvm/main';
import { HtmlView, querySelector, binding, trigger } from '../../../../mvvm-web/main';

@injectable()
export class TodoDeleteView extends HtmlView<TodoDelete> {
		template = `<p>Are you sure you want to delete '<span id="title"></span>'</p>
<button id="submit">Delete</button>
`
		@querySelector('#title')
		@binding('title', binding.From)
		title: HTMLElement;

		@querySelector('#submit')
		@trigger('delete')
		delete: HTMLElement;
}

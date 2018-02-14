import { TodoCreate } from '../../viewmodels/create';
import { injectable } from '../../../../mvvm/main';
import { HtmlView, querySelector, binding, trigger } from '../../../../mvvm-web/main';

@injectable()
export class TodoCreateView extends HtmlView<TodoCreate> {
		template = `
		<input id="title"/>
		<textarea id="description"></textarea>
		<button id="submit">Save</button>
		`

		@querySelector('#title')
		@binding('title', binding.To)
		title: HTMLElement;

		@querySelector('#description')
		@binding('description', binding.To)
		description: HTMLElement;

		@querySelector('#submit')
		@trigger('save')
		submit: HTMLElement;
}

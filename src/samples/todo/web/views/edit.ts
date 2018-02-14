import { TodoEdit } from '../../viewmodels/edit';
import { injectable } from '../../../../mvvm/main';
import { HtmlView, querySelector, binding, trigger } from '../../../../mvvm-web/main';

@injectable()
export class TodoEditView extends HtmlView<TodoEdit> {
		template = `
		<input id="title"/>
		<textarea id="description"></textarea>
		<button id="submit">Save</button>
		`

		@querySelector('#title')
		@binding('title', binding.TwoWay)
		title: HTMLElement;

		@querySelector('#description')
		@binding('description', binding.TwoWay)
		description: HTMLElement;

		@querySelector('#submit')
		@trigger('save')
		submit: HTMLElement;
}

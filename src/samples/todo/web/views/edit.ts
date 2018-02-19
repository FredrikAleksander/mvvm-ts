import { TodoEdit } from '../../viewmodels/edit';
import { injectable } from '../../../../mvvm/main';
import { HtmlView, BindingType, querySelector, binding, trigger } from '../../../../mvvm-web/main';

@injectable()
export class TodoEditView extends HtmlView<TodoEdit> {
		template = `
		<div class="form-field">
				<label for="title">Title:</label>
				<input id="title" />
		</div>
		<div class="form-field">
				<label for="description">Description:</label>
				<textarea id="description"></textarea>
		</div>
		<button id="submit">Save</button>
		`

		@querySelector('#title')
		@binding('title', BindingType.TwoWay)
		title: HTMLElement;

		@querySelector('#description')
		@binding('description', BindingType.TwoWay)
		description: HTMLElement;

		@querySelector('#submit')
		@trigger('save')
		submit: HTMLElement;
}

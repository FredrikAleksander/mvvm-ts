import { TodoCreate } from '../../viewmodels/create';
import { injectable } from '../../../../mvvm/main';
import { HtmlView, querySelector, binding, trigger } from '../../../../mvvm-web/main';

@injectable()
export class TodoCreateView extends HtmlView<TodoCreate> {
		template = `
		<div class="form-field">
				<label for="title">Title:</label>
				<input id="title" name="title"/>
		</div>
		<div class="form-field">
				<label for="description">Description:</label>
				<textarea id="description" name="description"></textarea>
		</div>
		<button class="button" id="submit">Save</button>
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

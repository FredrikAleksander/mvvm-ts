import { TodoDetails } from '../../viewmodels/details';
import { HtmlView, BindingType, querySelector, binding, trigger } from '../../../../mvvm-web/main';
import { injectable } from '../../../../mvvm/main';
import detailsTemplate from './templates/details.ejs';

@injectable()
export class TodoDetailsView extends HtmlView<TodoDetails> {
		template = `<h1></h1><p></p>`

		@querySelector('h1')
		@binding('title', BindingType.From)
		title: HTMLHeadingElement;

		@querySelector('p')
		@binding('description', BindingType.From)
		description: HTMLParagraphElement;
}

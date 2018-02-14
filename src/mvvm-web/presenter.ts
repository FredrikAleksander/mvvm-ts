import { IViewBase, IPresenter, injectable } from '../mvvm/main';
import { HtmlView } from './view';

@injectable()
export class HtmlPresenter implements IPresenter {
		private view: IViewBase|null = null;

		constructor(private element: HTMLElement) {
		}

		present(view: IViewBase) {
				if(!(view instanceof HtmlView)) {
						throw 'invalid view type';
				}
				if(this.view !== null) {
						this.view.detach();
				}
				this.element.innerHTML = '';
				this.view = view;

				if(view.element === null) {
						throw 'view not rendered';
				}
				this.element.appendChild(view.element);
		}
}

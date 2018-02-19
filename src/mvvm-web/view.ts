import { ISubscription, IContainer, TypeId, 
		IBinder as IBinderBase, ITriggerBinder as ITriggerBinderBase, 
		IBindingFactory as IBindingFactoryBase, IBinding as IBindingBase,
		IViewModel, View as BaseView, IView, IViewBase,
		BindingType, TriggerType,
		IViewFactory, getTypeId, injectable, inject,
		binding as bindingBase, trigger as triggerBase
		} from '../mvvm/main';

import 'reflect-metadata';

export type ViewTemplate<T> = ((data: T) => string) | string;

export class HtmlView<TViewModel extends IViewModel> extends BaseView<TViewModel> {
		element: HTMLElement|null = null;
		template?: ViewTemplate<TViewModel>;

		constructor(tag?: string) {
				super();
				if(typeof tag === 'string') {
						this.element = document.createElement(tag);
				}
				else {
						this.element = document.createElement('div');
				}
		}

		render() {
				if(!this.element || !this.viewModel) {
						return;
				}
				if(typeof this.template === 'string') {
						this.element.innerHTML = this.template;
				}
				else if(this.template && this.template.apply) {
						this.element.innerHTML = this.template(this.viewModel);
				}
		}
}

@injectable()
export class HtmlViewFactory implements IViewFactory {
		private map: Map<string|symbol, TypeId>;

		constructor(@inject(IContainer) private container: IContainer)
		{
				this.map = new Map();
		}

		register(viewType: TypeId, viewModelType: TypeId|TypeId[], implementation: Function): this {
				this.container.registerTransient(viewType, implementation);
				if(viewModelType instanceof Array) {
						for(var vmType of viewModelType) {
								this.map.set(getTypeId(vmType), viewType);
						}
				}
				else {
						this.map.set(getTypeId(viewModelType), viewType);
				}
				return this;
		}

		create<TViewModel extends IViewModel>(viewModelType: TypeId): Promise<IView<TViewModel>>;
		create(viewModelType: TypeId): Promise<IViewBase> {
				return new Promise((resolve, reject) => {
				    try {
							var viewType = this.map.get(getTypeId(viewModelType));
							if(viewType === undefined) { 
									throw 'no view mapped for view model'; 
							}
							resolve(this.container.resolve(viewType));
					}
					catch(ex) {
							reject(ex);
					}
				});
		}
}


export function querySelector(selector: string) {
		return function querySelectorDecorator(target, propertyKey) {
				function getter() {
						if(this.element) {
								return this.element.querySelector(selector);
						}
						return null;
				}

				Object.defineProperty(target, propertyKey, {
						get: getter,
						enumerable: true,
						configurable: false
				});
		};
}

function addEventSubscription(element: HTMLElement, type, listener): ISubscription {
		element.addEventListener(type, listener);
		return {
				unsubscribe: () => { element.removeEventListener(type, listener); }
		};
}

export type IBinder = IBinderBase<HTMLElement>;
export type IBinding = IBindingBase<HTMLElement>;

export const htmlBinder = {
		set: (element: HTMLElement, value: any): void => {
				if(element instanceof HTMLInputElement ||
						element instanceof HTMLTextAreaElement)
				{
						element.value = value;
				}
				else {
						element.innerText = value;
				}
		},
		setAttribute(element: HTMLElement, key: string, value: string) {
				element.setAttribute(key, value);
		},
		get: (element: HTMLElement): any => {
				if(element instanceof HTMLInputElement ||
						element instanceof HTMLTextAreaElement) 
				{
						return element.value;
				}
				else {
						return element.innerText;
				}
		},
		listen: (element: HTMLElement, listener): ISubscription => {
				if(element instanceof HTMLInputElement) {
						return addEventSubscription(element, 'change', listener);
				}
				else if(element instanceof HTMLTextAreaElement) {
						return addEventSubscription(element, 'input', listener);
				}
				return { unsubscribe: () => {} };
		}
};

export type IBindingFactory = IBindingFactoryBase<HTMLElement>;

export function binding(viewModelPropertyKey: string|symbol, bindingType: number, binder?: IBinder, bindingFactory?: IBindingFactory) {
		return bindingBase(viewModelPropertyKey, bindingType, binder || htmlBinder, bindingFactory);
}

function htmlTriggerBinder(triggerType: number): ITriggerBinderBase<HTMLElement> {
		const eventType = 'click';

		return {
				get: () => {
				},
				set: () => {
				},
				setAttribute(element: HTMLElement, key: string, value: string) {
						element.setAttribute(key, value);
				},
				listen: (element: HTMLElement) => {
						return { unsubscribe: () => {} };
				},
				listenTrigger: (element: HTMLElement, listener: () => void) => {
						return addEventSubscription(element, eventType, () => {
								listener();
						});
				}

		};
}


export function trigger(viewModelPropertyKey: string|symbol, triggerType: number=0) {
		return triggerBase<HTMLElement>(viewModelPropertyKey, triggerType, htmlTriggerBinder(triggerType));
}


export { BindingType, TriggerType }

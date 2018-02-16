import { ISubscription, IContainer, TypeId, 
		IViewModel, View as BaseView, IView, IViewBase,
		IViewFactory, getTypeId, injectable, inject } from '../mvvm/main';
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

		attach(vm: TViewModel) {
				super.attach(vm);
				this.render();
		}

		render() {
				if(!this.element || !this.viewModel) {
						return;
				}
				getBindings(this).reset();
				if(typeof this.template === 'string') {
						this.element.innerHTML = this.template;
				}
				else if(this.template && this.template.apply) {
						this.element.innerHTML = this.template(this.viewModel);
				}
				this.applyBindings();
		}

		applyBindings() {
				getBindings(this).applyBindings();
		}

		onViewModelPropertyChanged(propertyKey: string|symbol, oldValue: any, newValue: any) {
				getBindings(this)
						.onViewModelPropertyChanged(propertyKey, oldValue, newValue);
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

export interface IBinder {
		set(element: HTMLElement, value: any): void;
		get(element: HTMLElement): any;
		listen(element: HTMLElement, listener): ISubscription;

}

interface IBinding {
		key: string|symbol;
		viewModelPropertyKey: string|symbol;
		type: number;
		binder?: IBinder;
		factory?: IBindingFactory;
}

export const autoBinder = {
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

export class Binding {
		protected subscription: ISubscription|null;
		protected element: HTMLElement|null;
		protected binder: IBinder;

		constructor(protected view: HtmlView<any>, protected key: string|symbol, protected viewModelPropertyKey: string|symbol, protected type: number, binder?: IBinder) {
				this.subscription = null;
				this.element = null;
				this.binder = binder || autoBinder;
		}

		reset() {
				this.element = null;
				if(this.subscription !== null) {
						this.subscription.unsubscribe();
						this.subscription = null;
				}
		}

		bind(element: HTMLElement) {
				var self = this;
				var binder = this.binder;
				this.reset();
				element.setAttribute('data-binding-key', this.key.toString());
				element.setAttribute('data-binding-property', this.viewModelPropertyKey.toString());
				this.element = element;
				this.subscription =
					this.binder.listen(element, (event) => {
							self.viewChanged(self.binder.get(element));
					});
				if(this.view.viewModel &&
					this.viewModelPropertyKey in this.view.viewModel)
				{
					this.binder.set(element, this.view.viewModel[this.viewModelPropertyKey]);
				}
		}

		setViewModelValue(value: any) {
				if(this.view.viewModel && this.viewModelPropertyKey in
						this.view.viewModel)
				{
						this.view.viewModel[this.viewModelPropertyKey] = value;
				}
		}

		getViewModelValue(defaultValue: any): any {
				if(this.view.viewModel && this.viewModelPropertyKey in
						this.view.viewModel)
				{
						return this.view.viewModel[this.viewModelPropertyKey];
				}
				return defaultValue;
		}

		viewModelChanged(oldValue: any, newValue: any) {
				if(this.element !== null && (this.type == 0 || this.type == 2)) {
						var existing = this.binder.get(<any>this.element);
						if(existing !== newValue) {
								this.binder.set(<any>this.element, newValue);
						}
				}
		}
		
		viewChanged(value: any) {
				if(this.view.viewModel && (this.type == 1 || this.type == 2)) {
						var viewModelValue = this.getViewModelValue(value);
						if(viewModelValue !== value) {
								this.setViewModelValue(value);
						}
				}
		}
}

export interface IBindingFactory {
		(view, key: string|symbol, vmKey: string|symbol, type: number, binder?: IBinder): Binding;
}

class BindingSet {
		private map: Map<string|symbol, Binding>;
		private viewModelMap: Map<string|symbol, Binding[]>;

		constructor(private view: HtmlView<any>, bindings: IBinding[]) {
				this.map = new Map();
				this.viewModelMap = new Map();

				for(var binding of bindings) {
						var b : Binding;
						if(binding.factory)  {
								b = binding.factory(view, binding.key, binding.viewModelPropertyKey, binding.type, binding.binder);
						}
						else {
								b = new Binding(view, binding.key, binding.viewModelPropertyKey, binding.type, binding.binder);
						}
						if(!this.viewModelMap.has(binding.viewModelPropertyKey)) {
								this.viewModelMap.set(binding.viewModelPropertyKey, []);
						}
						(<any>this.viewModelMap.get(binding.viewModelPropertyKey)).push(b);
						this.map.set(binding.key, b);
				}
		}

		reset() {
				this.map.forEach((binding) => {
						binding.reset();
				});
		}

		applyBindings() {
				this.map.forEach((binding, key) => {
						var element = this.view[key];
						if(element instanceof HTMLElement)
						{
								binding.bind(element);
						}
						else {
								binding.reset();
						}
				});
		}

		onViewModelPropertyChanged(propertyKey: string|symbol, oldValue: any, newValue: any) {
				var bindings = this.viewModelMap.get(propertyKey) || [];
				for(var binding of bindings) {
						binding.viewModelChanged(oldValue, newValue);
				}
		}

		onViewInputElementChanged(propertyKey: string|symbol, newValue: any) {
				var binding = this.map.get(propertyKey);
				if(binding) {
						binding.viewChanged(newValue);
				}
		}
}

var bindingsMap : WeakMap<object, BindingSet> = new WeakMap();

function addViewBinding(type, propertyKey: string|symbol, viewModelPropertyKey: string|symbol, bindingType: number, binder?: IBinder, bindingFactory?: IBindingFactory) {
		var bindings = Reflect.getMetadata('_$$bindings', type) || [];
		bindings.push({
				key: propertyKey,
				viewModelPropertyKey: viewModelPropertyKey,
				type: bindingType,
				binder: binder,
				factory: bindingFactory
		});
		Reflect.defineMetadata('_$$bindings', bindings, type);
}

function getBindings(obj: HtmlView<any>): BindingSet {
		var data = bindingsMap.get(obj);
		if(!data) {
				var definitions = Reflect.getMetadata('_$$bindings', obj) || [];
				data = new BindingSet(obj, definitions);
				bindingsMap.set(obj, data);
		}
		return <any>data;
}

export interface BindingDecorator {
		From: number;
		To: number;
		TwoWay: number;
		(viewModelPropertyKey: string|symbol, bindingType: number, binder?: IBinder, factory?: IBindingFactory);
}

var binding: BindingDecorator = <any>function binding(viewModelPropertyKey: string|symbol, bindingType: number, binder?: IBinder, bindingFactory?: IBindingFactory) {
		return function bindingDecorator(target, propertyKey) {
				addViewBinding(target, propertyKey, viewModelPropertyKey, bindingType, binder, bindingFactory);
		};
}
binding.From = 0;
binding.To = 1;
binding.TwoWay = 2;

export { binding };

const nullBinder = {
				get: () => {
				},
				set: () => {
				},
				listen: (element: HTMLElement) => {
						return { unsubscribe: () => {} };
				}

};


class TriggerBinding extends Binding {
		constructor(view: HtmlView<any>, key: string|symbol, viewModelPropertyKey: string|symbol, type: number)
		{
				super(view, key, viewModelPropertyKey, type, nullBinder);
		}

		bind(element: HTMLElement) {
				var self = this;
				var binder = this.binder;
				this.reset();
				element.setAttribute('data-trigger-key', this.key.toString());
				element.setAttribute('data-trigger-property', this.viewModelPropertyKey.toString());
				this.element = element;
				if(element instanceof HTMLElement) {
						this.subscription =
								addEventSubscription(element, 'click', () => {
										self.trigger();
								});
				}
		}

		trigger() {
				if(this.view.viewModel && this.viewModelPropertyKey in
						this.view.viewModel && this.view.viewModel[this.viewModelPropertyKey].apply)
				{
						this.view.viewModel[this.viewModelPropertyKey]();
				}
		}

		setViewModelValue(value: any) {
		}

		getViewModelValue(defaultValue: any): any {
				return defaultValue;
		}

		viewModelChanged(oldValue: any, newValue: any) {
		}
		
		viewChanged(value: any) {
		}
}


export interface TriggerDecorator {
		Tap: number;
		Click: number;
		(viewModelPropertyKey: string|symbol, triggerType?: number);
}

var trigger: TriggerDecorator = <any>function trigger(viewModelPropertyKey: string|symbol, triggerType: number=0) {
		return function triggerDecorator(target, propertyKey) {
				addViewBinding(target, propertyKey, viewModelPropertyKey, 0, undefined, (view, key, vmKey, type) => new TriggerBinding(view, key, vmKey, type));
		};
}

trigger.Tap = 0;
trigger.Click = 1;

export { trigger }

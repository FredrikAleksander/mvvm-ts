import { TypeId } from './di';
import { ISubscription } from './subscription';
import { IViewModel } from './viewmodel';

export interface IViewBase {
		viewModel: any;

		attach(vm: IViewModel);
		detach();
}

export interface IView<TViewModel extends IViewModel> extends IViewBase {
		viewModel: TViewModel|null;

		attach(vm: TViewModel);
}
export const IView = 'mvvm::IView<TViewModel>';

export interface IViewFactory {
		create(viewModelType: TypeId): Promise<IViewBase>;
}
export const IViewFactory = 'mvvm::IViewFactory';

export class View<TViewModel extends IViewModel> implements IView<TViewModel> {
		private viewModelSubscription: ISubscription|null = null;

		viewModel: TViewModel|null = null;

		onViewModelPropertyChanged(propertyKey: string|symbol, 
				oldValue: any, newValue: any)
		{
				getBindings(this)
						.onViewModelPropertyChanged(propertyKey, oldValue, newValue);
		}

		private doRender() {
				getBindings(this).reset();
				this.render();
				getBindings(this).applyBindings();
		}

		attach(vm: TViewModel) {
				if(this.viewModelSubscription) {
						this.viewModelSubscription.unsubscribe();
						this.viewModelSubscription = null;
				}
				this.viewModel = vm;
				this.viewModelSubscription = 
						vm.onPropertyChanged((vm, key, oldValue, newValue) => {
								this.onViewModelPropertyChanged(key, oldValue, newValue);
						});

				this.doRender();
		}

		render() {
		}

		detach() {
				if(this.viewModelSubscription) {
						this.viewModelSubscription.unsubscribe();
						this.viewModelSubscription = null;
				}
				this.viewModel = null;
				getBindings(this).reset();
		}
}

export interface IBinder<TNativeView> {
		set(nativeView: TNativeView, value: any): void;
		get(nativeView: TNativeView): any;
		setAttribute(nativeView: TNativeView, key: string, value: string);
		listen(nativeView: TNativeView, listener): ISubscription;
}

export interface ITriggerBinder<TNativeView> extends IBinder<TNativeView> {
		listenTrigger(nativeView: TNativeView, listener: () => void): ISubscription;
}

export interface IBinding<TNativeView> {
		key: string|symbol;
		viewModelPropertyKey: string|symbol;
		type: number;
		binder: IBinder<TNativeView>;
		factory: IBindingFactory<TNativeView>;
}

export class Binding<TNativeView> {
		protected subscription: ISubscription|null;
		protected nativeView: TNativeView|null;
		protected binder: IBinder<TNativeView>;

		constructor(protected view: View<any>, protected key: string|symbol, protected viewModelPropertyKey: string|symbol, protected type: number, binder: IBinder<TNativeView>) {
				this.subscription = null;
				this.nativeView = null;
				this.binder = binder;
		}

		reset() {
				this.nativeView = null;
				if(this.subscription !== null) {
						this.subscription.unsubscribe();
						this.subscription = null;
				}
		}

		bind(nativeView: TNativeView) {
				var self = this;
				var binder = this.binder;
				this.reset();
				this.nativeView = nativeView;
				this.binder.setAttribute(nativeView, 'data-binding-key', this.key.toString());
				this.binder.setAttribute(nativeView, 'data-binding-property', this.viewModelPropertyKey.toString());
				this.subscription =
					this.binder.listen(nativeView, (event) => {
							self.viewChanged(self.binder.get(nativeView));
					});
				if(this.view.viewModel &&
					this.viewModelPropertyKey in this.view.viewModel)
				{
					this.binder.set(nativeView, this.view.viewModel[this.viewModelPropertyKey]);
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
				if(this.nativeView !== null && (this.type == 0 || this.type == 2)) {
						var existing = this.binder.get(<any>this.nativeView);
						if(existing !== newValue) {
								this.binder.set(<any>this.nativeView, newValue);
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

export interface IBindingFactory<TNativeView> {
		(view, key: string|symbol, vmKey: string|symbol, type: number, binder?: IBinder<TNativeView>): Binding<TNativeView>;
}

class BindingSet<TNativeView> {
		private map: Map<string|symbol, Binding<TNativeView>>;
		private viewModelMap: Map<string|symbol, Binding<TNativeView>[]>;

		constructor(private view: View<any>, bindings: IBinding<TNativeView>[]) {
				this.map = new Map();
				this.viewModelMap = new Map();

				for(var binding of bindings) {
						var b : Binding<TNativeView>;
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
						var nativeView = this.view[key];
						if(nativeView) {
								binding.bind(nativeView);
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

var bindingsMap : WeakMap<object, BindingSet<any>> = new WeakMap();

function addViewBinding<TNativeView>(type, propertyKey: string|symbol, viewModelPropertyKey: string|symbol, bindingType: number, binder: IBinder<TNativeView>, bindingFactory?: IBindingFactory<TNativeView>) {
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

function getBindings<TNativeView>(obj: View<any>): BindingSet<TNativeView> {
		var data = bindingsMap.get(obj);
		if(!data) {
				var definitions = Reflect.getMetadata('_$$bindings', obj) || [];
				data = new BindingSet(obj, definitions);
				bindingsMap.set(obj, data);
		}
		return <any>data;
}

export interface BindingDecorator<TNativeView> {
		From: number;
		To: number;
		TwoWay: number;
		(viewModelPropertyKey: string|symbol, bindingType: number, binder: IBinder<TNativeView>, factory: IBindingFactory<TNativeView>);
}

export function binding<TNativeView>(viewModelPropertyKey: string|symbol, bindingType: number, binder: IBinder<TNativeView>, bindingFactory?: IBindingFactory<TNativeView>) {
		return function bindingDecorator(target, propertyKey) {
				addViewBinding(target, propertyKey, viewModelPropertyKey, bindingType, binder, bindingFactory);
		};
}

export const BindingType = {
		From: 0,
		To: 1,
		TwoWay: 2
}

class TriggerBinding<TNativeView> extends Binding<TNativeView> {
		constructor(view: View<any>, key: string|symbol, viewModelPropertyKey: string|symbol, type: number, binder: ITriggerBinder<TNativeView>)
		{
				super(view, key, viewModelPropertyKey, type, binder);
		}

		bind(nativeView: TNativeView) {
				if(!!nativeView) {
						this.reset();
				}

				var self = this;
				var binder = <ITriggerBinder<TNativeView>>this.binder;
				this.reset();
				this.binder.setAttribute(nativeView, 'data-trigger-key', this.key.toString());
				this.binder.setAttribute(nativeView, 'data-trigger-property', this.viewModelPropertyKey.toString());
				this.nativeView = nativeView;
						this.subscription =
								binder.listenTrigger(nativeView, () => {
										self.trigger();
								});
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

export function trigger<TNativeView>(viewModelPropertyKey: string|symbol, triggerType: number=0, binder: ITriggerBinder<TNativeView>) {
		return function triggerDecorator(target, propertyKey) {
				addViewBinding<TNativeView>(target, propertyKey, viewModelPropertyKey, 0, binder, (view, key, vmKey, type) => new TriggerBinding(view, key, vmKey, type, binder));
		};
}


export const TriggerType = {
		Click: 0
};

import { IContainer, TypeId, injectable, inject } from './di';
import { ILogger } from './logger';
import { ISubscription } from './subscription';

export interface IViewModel {
		init(model: {}): Promise<void>;

		onPropertyChanged(handler: (vm: this, propertyKey: string|symbol, oldValue: any, newValue: any)=>void): ISubscription;
}
export const IViewModel = 'mvvm::IViewModel';

export interface IViewModelFactory {
		create<TViewModel extends IViewModel>(viewModelType: TypeId): Promise<TViewModel>;
		create(viewModelType: TypeId): Promise<IViewModel>;
}
export const IViewModelFactory = 'mvvm::IViewModelFactory';

export class ViewModel implements IViewModel {
		private subscriptions: Map<Symbol, (vm: this, propertyKey: string|symbol, oldValue: any, newValue: any)=>void> = new Map(); 

		notifyPropertyChanged(propertyKey: string|symbol, oldValue: any, newValue: any) {
				this.subscriptions.forEach((value) => {
						value(this, propertyKey, oldValue, newValue);
				});
		}

		onPropertyChanged(handler: (vm: this, propertyKey: string|symbol, oldValue: any, newValue: any)=>void): ISubscription {
				var id = Symbol();
				var subscription : ISubscription = {
						unsubscribe: () => {
								this.subscriptions.delete(id);
						}
				};
				this.subscriptions.set(id, handler);
				return subscription;
		}

		init(model: {}): Promise<void> {
				return Promise.resolve();
		}
}

@injectable()
export class ViewModelFactory implements IViewModelFactory {
		constructor(@inject(IContainer) private container: IContainer)
		{
		}

		register(viewModelType: TypeId, implementation: Function): this {
				this.container.registerTransient(viewModelType, implementation);
				return this;
		}

		create<TViewModel extends IViewModel>(viewModelType: TypeId): Promise<TViewModel>;
		create(viewModelType: TypeId): Promise<IViewModel> {
				return new Promise((resolve, reject) => {
					try {
							resolve(this.container.resolve(viewModelType));
					}
					catch(ex) {
							reject(ex);
					}
				});
		}
}


var propertyBackingFields: WeakMap<object, {}> = new WeakMap();

function getPropertyValue(target: object, propertyKey: string|symbol, defaultValue?: any) {
		var propertiesT = propertyBackingFields.get(target);
		var properties: {};
		if(propertiesT === undefined) {
				properties = {};
				propertyBackingFields.set(target, properties);
		}
		else {
				properties = propertiesT;
		}
		if(!(propertyKey in properties)) {
				properties[propertyKey] = defaultValue;
		}
		return properties[propertyKey];
}

function setPropertyValue(target: object, propertyKey: string|symbol, value: any, defaultValue?: any) {
		var oldValue = getPropertyValue(target, propertyKey, defaultValue);
		if(oldValue !== value) {
				var props = propertyBackingFields.get(target) || {};
				props[propertyKey] = value;

				if((<any>target).notifyPropertyChanged && (<any>target).notifyPropertyChanged.apply) {
						(<any>target).notifyPropertyChanged(propertyKey, oldValue, value);
				}
		}
}

export function property(defaultValue?: any, type?: TypeId) {
		return function propertyDecorator(target: any, propertyKey: string|symbol) {
				function getter() {
						return getPropertyValue(this, propertyKey, defaultValue);
				}

				function setter(value: any) {
						setPropertyValue(this, propertyKey, value, defaultValue);
				}

				Object.defineProperty(target, propertyKey, {
						get: getter,
						set: setter,
						enumerable: true,
						configurable: false
				});
		};
}

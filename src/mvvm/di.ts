import 'reflect-metadata';

export type TypeId = string|symbol|Function;

export interface IContainer {
		registerSingleton(type: TypeId|TypeId[], implementation: Function): this;
		registerTransient(type: TypeId|TypeId[], implementation: Function): this;
		registerInstance(type: TypeId|TypeId[], instance: any): this;
		use(installer: (container: IContainer) => void): this;

		resolve<T>(type: TypeId): T;
		resolve(type: TypeId): any;
}
export const IContainer = 'mvvm::IContainer';

type IConstructorParameter = Function|FactoryType;

interface IConstructorInfo {
		paramTypes: IConstructorParameter[];
}

function getTypeSymbol(clazz: any): string|symbol {
		if(!Reflect.hasOwnMetadata('_$$typeid', clazz)) {
				Reflect.defineMetadata('_$$typeid', Symbol(clazz.name), clazz);
		}
		return Reflect.getOwnMetadata('_$$typeid', clazz);
}

export function getTypeId(typ: TypeId): string|symbol {
		var typename = typeof typ;
		if(typename === 'symbol') { return <symbol>typ; }
		if(typename === 'string') { return <string>typ; }
		if(typename === 'function') {
				return getTypeSymbol(<Function>typ);
		}
		throw 'invalid typeid';
}

function getConstructorMetadata(implementation: Function, createIfNotExists: boolean) {
		if(!Reflect.hasOwnMetadata('_$$ctor', implementation)) {
				if(!createIfNotExists) {
						throw `Type '${implementation.name}' is not injectable. Use @injectable decorator`;
				} 
				var paramTypes = [];
				if(Reflect.hasOwnMetadata('design:paramtypes', implementation)) {
						paramTypes = Reflect.getOwnMetadata('design:paramtypes', implementation);
				}
				Reflect.defineMetadata('_$$ctor', {
						paramTypes: paramTypes
				}, implementation);
		}
		return Reflect.getOwnMetadata('_$$ctor', implementation);
}

function factoryForClass(implementation: any) {
		if(!Reflect.hasOwnMetadata('_$$ctor', implementation)) {
				throw `Type '${implementation.name}' is not injectable. Use @injectable decorator`;
		}
		var ctorMetadata = getConstructorMetadata(implementation, false);

		return (container: IContainer) => {
				var parameters: any[] = [];

				for(var i = 0; i < ctorMetadata.paramTypes.length; i++) {
						if(ctorMetadata.paramTypes[i] instanceof FactoryType) {
								var factoryType : FactoryType = ctorMetadata.paramTypes[i];
								parameters.push(
										() => container.resolve(<any>factoryType.typeId));
						}
						else {
								parameters.push(container.resolve(ctorMetadata.paramTypes[i]));
						}
				}
				return new implementation(...parameters);
		};
}

class FactoryType {
		constructor(public typeId: TypeId) {
		}
}

export function injectable() {
		return function injectableDecorator(target: any) {
				getConstructorMetadata(target, true);
		};
}

export function injectFactory(key: TypeId) {
		return function injectFactoryDecorator(target: any, propertyKey: string | symbol, parameterIndex: number) {
				var metadata = getConstructorMetadata(target, true);
				metadata.paramTypes[parameterIndex] = new FactoryType(key);
		}
}

export function inject(key: TypeId) {
		return function injectDecorator(target: any, propertyKey: string | symbol, parameterIndex: number) {
				var metadata = getConstructorMetadata(target, true);
				metadata.paramTypes[parameterIndex] = key;
		};
}

class Registration {
		private value: any;

		constructor(private factory: (container: IContainer) => any, 
				private cache: boolean) 
		{
		}
		resolve(container: IContainer): any {
				if(this.cache) {
						if(this.value === undefined) {
								this.value = this.factory(container) || null;
						}
						return this.value;
				}
				return this.factory(container);
		}
}

export class Container implements IContainer {
		private registrations: Map<string|symbol, Registration>;

		constructor() {
				this.registrations = new Map<string|symbol, Registration>();
		}
		private register(type: TypeId|TypeId[], registration: Registration): this {
				if(type instanceof Array) {
						for(var key of type) {
								this.registrations.set(getTypeId(key), registration);
						}
				}
				else {
						this.registrations.set(getTypeId(type), registration);
				}
				return this;
		}

		registerFactory(type: TypeId|TypeId[], factory: (container: IContainer) => any): this {
				return this.register(type,new Registration(factory, false));	
		}
		registerSingleton(type: TypeId|TypeId[], implementation: Function): this {
				return this.register(type,new Registration(factoryForClass(implementation), true));
		}
		registerTransient(type: TypeId|TypeId[], implementation: Function): this {
				return this.register(type,new Registration(factoryForClass(implementation), false));
		}
		registerInstance(type: TypeId|TypeId[], instance: any): this {
				return this.register(type,new Registration(() => { return instance; }, true));
		}
		use(installer: (container: IContainer) => void): this {
				installer(this);
				return this;
		}

		resolve<T>(type: TypeId): T;
		resolve(type: TypeId): any {
				var registration = this.registrations.get(getTypeId(type));
				if(!registration) {

						throw `Type '${getTypeId(type)}' not registered!`;
				}
				return registration.resolve(this);
		}
}


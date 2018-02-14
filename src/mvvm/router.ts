import { TypeId, inject, injectable } from './di';
import { ILogger } from './logger';
import { IViewModel, IViewModelFactory } from './viewmodel';
import { IView, IViewFactory } from './view';
import { IPresenter } from './presenter';

export interface IRouter {
		map(pathTemplate: string, viewModelType: TypeId) : this;
		use(installer: (router: IRouter) => void): this;
		navigate(path: string): Promise<void>;
}
export const IRouter = 'mvvm::IRouter';

export class NullRouter {
		map(pathTemplate: string, viewModelType: TypeId): this {
				return this;
		}
		use(installer: (router: IRouter) => void): this {
				return this;
		}
		navigate(path: string): Promise<void> {
				return Promise.resolve();
		}
}

export type PathParameter = [number, string];
export const PathParameter = Symbol();


type PathSegment = string|Symbol;

function compareSegments(a: PathSegment[], b: PathSegment[]): boolean {
		if(a.length !== b.length) {
				return false;
		}
		var len = a.length;
		for(var i = 0; i < len; i++) {
				if(a[i] !== b[i] &&
						a[i] !== PathParameter &&
						b[i] !== PathParameter)
				{
						return false;
				}
		}
		return true;
}

function parseTemplateParameters(pathTemplate: string): string[] {
		return pathTemplate
				.replace(/^\//, '') // Trim leading slashes
				.replace(/\/$/, '') // Trim trailing slashes
				.split('/')         // Split into segments
				.filter((segment) => 
						segment.startsWith('{') && segment.endsWith('}')
				).map((parameter) => parameter
						.replace(/^\{/, '')
						.replace(/\}/, '')
				);
}
function parseTemplateSegments(pathTemplate: string): PathSegment[] {
		return pathTemplate
				.replace(/^\//, '') // Trim leading slashes
				.replace(/\/$/, '') // Trim trailing slashes
				.split('/')         // Split into segments
				.map((segment) => {
						// If segment starts with { and ends with }
						// it is a path parameter
						if(segment.startsWith('{') && segment.endsWith('}'))
						{
								return PathParameter;
						}
						return segment;
				});
}

function parsePathSegments(path: string): PathSegment[] {
		return path
				.replace(/^\//, '') // Trim leading slashes
				.replace(/\/$/, '') // Trim trailing slashes
				.split('/')         // Split into segments
}

interface IRouteTableEntry {
		parameters: string[];
		segments: PathSegment[];
		viewModelType: TypeId;
}

@injectable()
export class Router implements IRouter {
		private routeTable: IRouteTableEntry[];
		private catchAll: IRouteTableEntry|null = null;

		constructor(
				@inject(ILogger) private logger: ILogger,
				@inject(IViewModelFactory) private viewModelFactory: 
						IViewModelFactory,
				@inject(IViewFactory) private viewFactory: IViewFactory,
				@inject(IPresenter) private presenter: IPresenter)
		{
				this.routeTable = [];
		}

		private parsePath(path: string): [TypeId, {}] {
				var segments = parsePathSegments(path);
				for(var route of this.routeTable) {
						if(compareSegments(route.segments, segments)) {
								var parameters = {};
								var len = route.segments.length;
								var paramIndex = 0;
								for(var i = 0; i < len; i++) {
										if(route.segments[i] === PathParameter) {
												parameters[route.parameters[paramIndex]]
														= segments[i];
												paramIndex++;
										}
								}
								return [route.viewModelType, parameters];
						}
				}
				if(this.catchAll !== null) {
						return [this.catchAll.viewModelType, this.catchAll.parameters];
				}
				throw 'Failed to find matching route and no catch all registered';
		}

		use(installer: (router: IRouter) => void): this {
				installer(this);
				return this;
		}

		map(pathTemplate: string, viewModelType: TypeId): this {
				if(pathTemplate === '*') {
						if(this.catchAll !== null) {
								throw 'catch all is already registered';
						}
						this.catchAll = {
								parameters: [],
								viewModelType: viewModelType,
								segments: ['*']
						};
						return this;
				}

				var parameters = parseTemplateParameters(pathTemplate);
				var segments = parseTemplateSegments(pathTemplate);
				for(var route of this.routeTable) {
						if(compareSegments(route.segments, segments)) {
								throw 'Attempted to map conflicting route';
						}
				}
				this.routeTable.push({
						parameters: parameters,
						segments: segments,
						viewModelType: viewModelType
				});
				return this;
		}

		async navigate(path: string): Promise<void> {
				this.logger.write(0, `Navigating to ${path}`);
				try {
						var [viewModelType, routeParameters] = this.parsePath(path);
						var viewModel = await this.viewModelFactory.create(viewModelType);
						var view = await this.viewFactory.create(viewModelType);
						await viewModel.init(routeParameters);
						view.attach(viewModel);
						this.presenter.present(view);
				}
				catch(ex) {
						this.logger.write(3, `Navigation Error: ${ex}`);
						throw ex;
				}
		}
}

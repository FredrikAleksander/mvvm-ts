import { ILogger, IViewModelFactory, IViewFactory,
		IPresenter, Router, injectable, inject } from '../mvvm/main';


@injectable()
export class WebRouter extends Router {
		private entryPoint: string|null;
		private hashchangeSupport: boolean;

		constructor(
				@inject(ILogger) logger: ILogger,
				@inject(IViewModelFactory) viewModelFactory: 
						IViewModelFactory,
				@inject(IViewFactory) viewFactory: IViewFactory,
				@inject(IPresenter) presenter: IPresenter)
		{
				super(logger, viewModelFactory, viewFactory, presenter);
				this.entryPoint = null;
				this.hashchangeSupport = 'onhashchange' in window;
				if(this.hashchangeSupport) {
						var self = this;
						window.addEventListener('hashchange', (event: HashChangeEvent) => {
								var hash = location.hash;
								if(hash.length > 1) {
										self.navigate(hash.substring(1));
								}
								else if(this.entryPoint !== null) {
										self.navigate(this.entryPoint);
								}
						});
				}
		}

		async navigate(path: string) {
				if(this.hashchangeSupport && (location.hash.length < 2 ||
						location.hash.substring(1) !== path))
				{
						location.hash = path;
				}
				else {
						await super.navigate(path);
				}
		}

		async navigateEntryPoint(defaultEntryPoint: string) {
				this.entryPoint = defaultEntryPoint;
				if(location.hash.length > 1) {
						return await this.navigate(location.hash.substring(1));
				}
				location.hash = '#' + defaultEntryPoint;
		}
}

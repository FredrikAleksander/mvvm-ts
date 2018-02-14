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
		}

		detach() {
				if(this.viewModelSubscription) {
						this.viewModelSubscription.unsubscribe();
						this.viewModelSubscription = null;
				}
				this.viewModel = null;
		}
}


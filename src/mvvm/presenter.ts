import { IViewBase } from './view';

export interface IPresenter {
		present(view: IViewBase);
}
export const IPresenter = 'mvvm::IPresenter';

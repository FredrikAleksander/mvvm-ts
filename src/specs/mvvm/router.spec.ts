import { TypeId, IViewModel, ViewModel, IViewModelFactory,
		IView, IViewBase, View, IViewFactory, IPresenter,
		Router } from '../../mvvm/main';
import { expect, use, should } from 'chai';
import { SinonSpy, spy, match, stub } from 'sinon';
import 'mocha';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';

should();
use(chaiAsPromised);
use(sinonChai);

class MockViewModel extends ViewModel {
		async init(model: {}): Promise<void> {
				await super.init(model);
		}
}

class MockViewModelFactory implements IViewModelFactory {
		create<TViewModel extends IViewModel>(viewModelType: TypeId): Promise<TViewModel>;
		create(viewModelType: TypeId): Promise<IViewModel> {
				return Promise.resolve(new MockViewModel());
		}
}

class MockView extends View<MockViewModel> {
}

class MockViewFactory implements IViewFactory {
		create(viewModelType: TypeId): Promise<MockView> {
				return Promise.resolve(new MockView());
		}
}

class MockPresenter implements IPresenter {
		present(view: IViewBase) {
		}
}

var vmFactory = new MockViewModelFactory();
var viewFactory = new MockViewFactory();
var presenter = new MockPresenter();
var logger = { write: (level, msg) => {} }

describe('Router class', () => {
		it('should throw when no route matches and no catch all is registered', () => {
				var router = new Router(logger, vmFactory, viewFactory, presenter);
				router.map('/StartPage', MockViewModel);
				expect(router.navigate('/invalid')).to.be.rejected;
		});
		it('should fallback to the catch all route if no route matches', async () => {
				var vm = new MockViewModel();
				var presentCallback = spy();
				var router = new Router(logger, { create: () => Promise.resolve(vm) }, viewFactory, { present: presentCallback });
				router.map('*', MockViewModel);
				await router.navigate('/invalid');
				expect(presentCallback).to.have.been.calledWith(match((view) => view.viewModel === vm));

		});
		it('should not allow possibly conflicting routes to match', () => {
				(() => {
						var router = new Router(logger, vmFactory, viewFactory, presenter);
						router.map('/Thread/Something/', MockViewModel);
						router.map('/Thread/{threadId}', MockViewModel);
				}).should.throw();
		});
		it('should pass the right parameters into the view model init function', async () => {	
				var vm = new MockViewModel();
				var initCallback = stub(vm, 'init').returns(Promise.resolve());
				var presentCallback = spy();
				var router = new Router(logger, { create: () => Promise.resolve(vm) }, viewFactory, { present: presentCallback });
				router.map('/Thread/{threadId}/', MockViewModel);
				await router.navigate('/Thread/1');
				initCallback.should.have.been.calledWith({"threadId": "1"});
				presentCallback.should.have.been.calledWith(match((view) => view.viewModel === vm));
		});
		it('should support paths with multiple parameter segments', async () => {
				var vm = new MockViewModel();
				var initCallback = stub(vm, 'init').returns(Promise.resolve());
				var presentCallback = spy();
				var router = new Router(logger, { create: () => Promise.resolve(vm) }, viewFactory, { present: presentCallback });
				router.map('/Thread/{threadId}/{postId}/Edit', MockViewModel);
				await router.navigate('Thread/1/094302940234/Edit/');
				initCallback.should.have.been.calledWith({ "threadId": "1", "postId": "094302940234" });
				presentCallback.should.have.been.calledWith(match((view) => view.viewModel === vm));
		});
});

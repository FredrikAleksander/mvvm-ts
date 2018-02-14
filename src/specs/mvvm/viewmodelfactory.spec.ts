import { TypeId, Container, injectable,
		IViewModel, ViewModel, IViewModelFactory, 
		ViewModelFactory } from '../../mvvm/main';
import { expect, use, should } from 'chai';
import { SinonSpy, spy, match, stub } from 'sinon';
import 'mocha';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';

should();
use(chaiAsPromised);
use(sinonChai);

@injectable()
class MockViewModel extends ViewModel {
		async init(model: {}): Promise<void> {
				await super.init(model);
		}
}
@injectable()
class MockViewModel2 extends ViewModel {
		async init(model: {}): Promise<void> {
				await super.init(model);
		}
}


describe('ViewModelFactory class', () => {
		it('should register ViewModels with the container as transients', () => {
				var container = new Container();
				var proxy = spy(container, 'registerTransient');
				var vmFactory = new ViewModelFactory(container);
				vmFactory.register(MockViewModel, MockViewModel);
				expect(proxy).to.have.been.calledWith(MockViewModel, MockViewModel);
		});
		it('should resolve the right view model for the specified type', () => {
				var container = new Container();
				var vmFactory = new ViewModelFactory(container)
						.register(MockViewModel, MockViewModel)
						.register(MockViewModel2, MockViewModel2);
				var obj1 = vmFactory.create(MockViewModel);
				var obj2 = vmFactory.create(MockViewModel2);

				expect(obj1).to.eventually.instanceOf(MockViewModel);
				expect(obj2).to.eventually.instanceOf(MockViewModel2);
		});
});

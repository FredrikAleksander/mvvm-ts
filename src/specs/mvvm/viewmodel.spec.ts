import { TypeId, IViewModel, ViewModel } from '../../mvvm/main';
import { expect, use, should } from 'chai';
import { SinonSpy, spy, match, stub } from 'sinon';
import 'mocha';
import * as sinonChai from 'sinon-chai';

should();
use(sinonChai);

class MockViewModel extends ViewModel {
		private _value: string = '';

		get value(): string {
				return this._value;
		}
		set value(val: string) {
				if(this._value !== val) {
						var oldValue = this._value;
						this._value = val;
						this.notifyPropertyChanged('value', oldValue, val);
				}
		}

		async init(model: {}): Promise<void> {
				await super.init(model);
		}
}

describe('ViewModel class', () => {
		it('should call all subscribers with updates', () => {
				var callback1 = spy();
				var callback2 = spy();

				var vm = new MockViewModel();
				vm.onPropertyChanged(callback1);
				vm.onPropertyChanged(callback2);
				vm.value = 'test';

				expect(callback1).to.have.been.calledOnce.calledWith(vm, 'value', '', 'test');
				expect(callback2).to.have.been.calledOnce.calledWith(vm, 'value', '', 'test');

		});
		it('should not call subscribers after they have unsubscribed', () => {
				var callback1 = spy();
				var callback2 = spy();

				var vm = new MockViewModel();
				vm.onPropertyChanged(callback1)
						.unsubscribe();
				vm.onPropertyChanged(callback2);

				vm.value = 'test';

				expect(callback1).to.not.have.been.called;
				expect(callback2).to.have.been.calledWith(vm, 'value', '', 'test');
		});
});

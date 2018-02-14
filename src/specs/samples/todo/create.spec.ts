import { NullRouter } from '../../../mvvm/main';
import { ITodoService, NullTodoService } from '../../../samples/todo/services/todo';
import { ITask } from '../../../samples/todo/models/task';
import { TodoCreate } from '../../../samples/todo/viewmodels/create';
import { expect, use, should } from 'chai';
import { SinonSpy, createStubInstance, spy, match, stub } from 'sinon';
import 'mocha';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';

const nullLogger = { write: (level: number, message: string) => {} };

const tasksRegex = /\/?Tasks\/?/;

describe('TodoCreate view model', () => {
		it('should not attempt to save if the title or description is empty', async () => {
				var router = new NullRouter();
				var todoService = new NullTodoService();

				var callback = spy(todoService, 'createTask');
				var vm = new TodoCreate(router, todoService);

				vm.title = '';
				vm.description = '';

				try {
						await vm.save()
				}
				catch(ex) {
				}

				expect(callback).not.to.have.been.called;
		});
		it('should save by calling the provided  ITodoService', async () => {
				var router = new NullRouter();
				var todoService = new NullTodoService();

				var callback = spy(todoService, 'createTask');
				var vm = new TodoCreate(router, todoService);

				vm.title = 'test';
				vm.description = 'test';

				try {
						await vm.save();
				}
				catch(ex) {
				}

				expect(callback).to.be.called;
		});
		it('should navigate to \'/Tasks\' on succesful save', async () => {
				var router = new NullRouter();
				var todoService = new NullTodoService();

				stub(todoService, 'createTask').returns(Promise.resolve({
						id: "1",
						title: "test",
						description: "test"
				}));

				var callback = spy(router, 'navigate');
				var vm = new TodoCreate(router, todoService);

				vm.title = 'test';
				vm.description = 'test';

				try {
						await vm.save();
				}
				catch(ex) {
				}

				expect(callback).to.be.calledWithMatch((value) => tasksRegex.test(value));
		});
		it('should not navigate to \'/Tasks\' on a failed save', async () => {
				var router = new NullRouter();
				var todoService = new NullTodoService();

				stub(todoService, 'createTask').returns(Promise.reject<ITask>('error'));

				var callback = spy(router, 'navigate');
				var vm = new TodoCreate(router, todoService);

				vm.title = 'test';
				vm.description = 'test';

				try {
						await vm.save();
				}
				catch(ex) {
				}

				expect(callback).to.not.be.calledWithMatch((value) => tasksRegex.test(value));
		});
});

import { NullRouter } from '../../../mvvm/main';
import { ITodoService, NullTodoService } from '../../../samples/todo/services/todo';
import { ITask } from '../../../samples/todo/models/task';
import { TodoEdit } from '../../../samples/todo/viewmodels/edit';
import { expect, use, should } from 'chai';
import { SinonSpy, createStubInstance, spy, match, stub } from 'sinon';
import 'mocha';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';

const nullLogger = { write: (level: number, message: string) => {} };

const tasksRegex = /\/?Tasks\/?/;

describe('TodoEdit view model', () => {
		it('should not attempt to save if the title or description is empty', async () => {
				var router = new NullRouter();
				var todoService = new NullTodoService();

				stub(todoService, 'getTask').returns(Promise.resolve({
						id: "0",
						name: "",
						description: ""
				}));

				var callback = spy(todoService, 'createTask');
				var vm = new TodoEdit(router, todoService);

				await vm.init({ taskId: "0"});

				try {
						await vm.save();
				}
				catch(ex) {
				}

				expect(callback).not.to.have.been.called;
		});
});

import { ITask } from '../models/task';

export interface ITodoService {
		getTasks(): Promise<ITask[]>;
		getTask(id: string): Promise<ITask>;
		createTask(title: string, description: string): Promise<ITask>;
		deleteTask(id: string): Promise<void>;
		updateTask(id: string, title: string, description: string): Promise<void>;
}
export const ITodoService = 'todo::ITodoService';

export class NullTodoService implements ITodoService {
		getTasks(): Promise<ITask[]> { return Promise.resolve([]); }
		getTask(id: string): Promise<ITask> { return Promise.reject<ITask>('no such task'); }
		createTask(title: string, description: string): Promise<ITask> {
				return Promise.reject('invalid operation');
		}
		deleteTask(id: string): Promise<void> {
				return Promise.reject('invalid operation');
		}
		updateTask(id: string, title: string, description: string): Promise<void> {
				return Promise.reject('invalid operation');
		}
}

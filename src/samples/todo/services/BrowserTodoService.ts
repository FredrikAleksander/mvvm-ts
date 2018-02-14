import { injectable } from '../../../mvvm/main';
import { ITodoService } from '../services/todo';
import { ITask } from '../models/task';

function generateTaskId() {
		var counterData = localStorage.getItem('tasks.counter');
		var counter : number;
		if(counterData === null) {
				counter = 0;
		}
		else {
				counter = parseInt(counterData, 10) + 1;
		}
		localStorage.setItem('tasks.counter', counter.toString());
		return counter.toString();
}

function getTasks() {
		var tasksData = localStorage.getItem('tasks');
		var tasks: ITask[];
		if(tasksData === null) {
				tasks = [];
				localStorage.setItem('tasks.counter', '0');
				localStorage.setItem('tasks', JSON.stringify(tasks));
		}
		else {
				tasks = JSON.parse(tasksData);
		}
		return tasks;
}

@injectable()
export class BrowserTodoService implements ITodoService {
		async getTasks(): Promise<ITask[]> {
				return getTasks();
		}

		async getTask(id: string): Promise<ITask> {
				var tasks = getTasks();
				var index = tasks.findIndex((task) => task.id === id);
				if(index !== -1) {
						return tasks[index];
				}
				throw 'no such task';
		}

		async createTask(title, description): Promise<ITask> {
				var now = new Date();
				var tasks = getTasks();
				var task : ITask = {
						id: generateTaskId(),
						title: title,
						created: now,
						modified: now,
						description: description
				};
				tasks.push(task);
				localStorage.setItem('tasks', JSON.stringify(tasks));
				return task;
		}

		async deleteTask(id: string): Promise<void> {
				var tasks = getTasks()
						.filter((task) => task.id !== id);
				localStorage.setItem('tasks', JSON.stringify(tasks));
		}

		async updateTask(id: string, title: string, description: string): Promise<void> {
				var tasks = getTasks();
				var index = tasks.findIndex((task) => id === task.id);
				if(index !== -1) {
						tasks[index].title = title;
						tasks[index].description = description;
						tasks[index].modified = new Date();
						localStorage.setItem('tasks', JSON.stringify(tasks));
				}
				else {
						throw 'invalid task';
				}
		}
}

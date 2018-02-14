import { ISubscription } from './subscription';

function emptySubscription() {
		return { unsubscribe: () => {} };
}

export interface IObservableItemChanged {
		(): void;
}

export interface IObservableItemAdded {
}

export interface IObservableItemRemoved {
}

export class ObservableCollection<TItem> implements Iterable<TItem> {
		private items: TItem[];
		private *iterate() {
		}

		constructor(items: Iterable<TItem>) {
				this.items = [];
				for(var i of items) {
						this.add(i);
				}
		}

		protected notifyItemChanged(index: number, oldValue: TItem, newValue: TItem)
		{
		}
		
		protected notifyItemAdded(index: number, value: TItem)
		{
		}
		
		protected notifyItemRemoved(index: number, value: TItem)
		{
		}
		

		onItemChanged(listener: IObservableItemChanged): ISubscription {
				return emptySubscription();
		}
		
		onItemAdded(listener: IObservableItemAdded): ISubscription {
				return emptySubscription();
		}
		
		onItemRemoved(listener: IObservableItemRemoved): ISubscription {
				return emptySubscription();
		}

		get length(): number {
				return this.items.length;
		}

		get(index: number): TItem {
				if(index < 0 || index >= this.items.length) {
						throw 'out of bounds';
				}
				return this.items[index];
		}

		set(index: number, item: TItem) {
				if(index < 0 || index >= this.items.length) {
						throw 'out of bounds';
				}
				var old = this.items[index];
				if(old !== item) {
						this.items[index] = item;
						this.notifyItemChanged(index, old, item);
				}
		}

		add(item: TItem) {
				var index = this.items.length;
				this.items.push(item);
				this.notifyItemAdded(index, item);
		}

		remove(item: TItem) {
				var len = this.items.length;
				for(var i = 0; i < len; i++) {
						if(this.items[i] === item) {
								break;
						}
				}
				if(i < len) {
						this.removeByIndex(i);
				}
		}

		removeByIndex(index: number) {
		}

		clear() {
				var i = this.items.length - 1;
				for(; i >= 0; i--) {
						this.removeByIndex(i);
				}
		}
		
		[Symbol.iterator](): Iterator<TItem> {
				return this.iterate();
		}
}

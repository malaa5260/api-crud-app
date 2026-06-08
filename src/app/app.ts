import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize, timeout } from 'rxjs';

import { AddItem } from './components/add-item/add-item';
import { ItemList } from './components/item-list/item-list';
import { ApiObject, CreateApiObject } from './models/api-object';
import { ObjectsApi } from './services/objects-api';

@Component({
  selector: 'app-root',
  imports: [AddItem, ItemList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly objectsApi = inject(ObjectsApi);

  items = signal<ApiObject[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  deletingId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.objectsApi
      .getItems()
      .pipe(
        timeout(10000),
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (items) => {
          this.items.set(items);
        },
        error: () => {
          this.errorMessage.set('Could not load items from the API.');
        },
      });
  }

  addItem(item: CreateApiObject): void {
    this.errorMessage.set('');

    this.objectsApi.addItem(item).subscribe({
      next: (createdItem) => {
        this.items.update((items) => [createdItem, ...items]);
      },
      error: () => {
        this.errorMessage.set('Could not add the item. Please try again.');
      },
    });
  }

  deleteItem(id: string): void {
    this.deletingId.set(id);
    this.errorMessage.set('');

    this.objectsApi.deleteItem(id).subscribe({
      next: () => {
        this.items.update((items) => items.filter((item) => item.id !== id));
        this.deletingId.set(null);
      },
      error: () => {
        this.errorMessage.set('Could not delete the item. Try deleting an item you created in this session.');
        this.deletingId.set(null);
      },
    });
  }
}

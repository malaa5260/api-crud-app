import { Component, inject, OnInit } from '@angular/core';
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

  items: ApiObject[] = [];
  isLoading = false;
  errorMessage = '';
  deletingId: string | null = null;

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    debugger;
    this.isLoading = true;
    this.errorMessage = '';

    this.objectsApi
      .getItems()
      .pipe(
        timeout(10000),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (items) => {
          this.items = items;
        },
        error: () => {
          this.errorMessage = 'Could not load items from the API.';
        },
      });
  }

  addItem(item: CreateApiObject): void {
    this.errorMessage = '';

    this.objectsApi.addItem(item).subscribe({
      next: (createdItem) => {
        this.items = [createdItem, ...this.items];
      },
      error: () => {
        this.errorMessage = 'Could not add the item. Please try again.';
      },
    });
  }

  deleteItem(id: string): void {
    this.deletingId = id;
    this.errorMessage = '';

    this.objectsApi.deleteItem(id).subscribe({
      next: () => {
        this.items = this.items.filter((item) => item.id !== id);
        this.deletingId = null;
      },
      error: () => {
        this.errorMessage = 'Could not delete the item. Try deleting an item you created in this session.';
        this.deletingId = null;
      },
    });
  }
}

import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

import { ApiObject } from '../../models/api-object';

@Component({
  selector: 'app-item-list',
  imports: [],
  templateUrl: './item-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './item-list.css',
})
export class ItemList {
  @Input({ required: true }) items: ApiObject[] = [];
  @Input() deletingId: string | null = null;
  @Output() itemDeleted = new EventEmitter<string>();


  constructor() {
    console.log('ItemList component initialized with items:', this.items);
  }
}

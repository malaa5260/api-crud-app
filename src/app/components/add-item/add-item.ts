import { Component, EventEmitter, inject, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CreateApiObject, toCreateApiObjectDto } from '../../models/api-object';

@Component({
  selector: 'app-add-item',
  imports: [ReactiveFormsModule],
  templateUrl: './add-item.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './add-item.css',
})
export class AddItem {
  private readonly formBuilder = inject(FormBuilder);

  @Output() itemCreated = new EventEmitter<CreateApiObject>();

  itemForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    color: [''],
    capacity: [''],
  });

  submit(): void {
    if (!this.itemForm.controls.name.value.trim()) {
      return;
    }

    this.itemCreated.emit(toCreateApiObjectDto(this.itemForm.getRawValue()));
    this.reset();
  }

  reset(): void {
    this.itemForm.reset();
  }
}

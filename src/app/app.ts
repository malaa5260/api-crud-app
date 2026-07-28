import { assertNotInReactiveContext, Component, computed, effect, inject, isSignal, isWritableSignal, linkedSignal, OnInit, signal, untracked } from '@angular/core';
import { finalize, timeout } from 'rxjs';

import { AddItem } from './components/add-item/add-item';
import { ItemList } from './components/item-list/item-list';
import { ApiObject, CreateApiObject } from './models/api-object';
import { ObjectsApi } from './services/objects-api';
import { FormsModule } from '@angular/forms';
interface IProduct {
  id: number;
  name: string;
}
@Component({
  selector: 'app-root',
  imports: [AddItem, ItemList, FormsModule],
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

  //assertNotInReactiveContext

  count = signal(0);

  doubleCount = computed(() => {
    //reactive context

    //this.fetchData();
    return this.count() * 2;
  });

  fetchData() {
    assertNotInReactiveContext(this.fetchData);
    // SIDE EFFECT - THIS FUNCTION DOES SOMETHING
    console.log('Fetching data...');
  }

  incrementCount() {
    this.count.update(value => value + 1);
  }

  //computed
  unitPrice = signal(70);
  quantity = signal(2);

  totalPrice = computed(() => this.unitPrice() * this.quantity());

  increaseQuantity() {
    this.quantity.update(value => value + 1);
  }

  //asReadonly
  user = signal({
    name: "John",
    age: 30
  }).asReadonly();


  // Deep Mutation
  changeUserData() {
    this.user().name = "AYMAN";
    this.user().age = 40;
  }


  //constructor
  // constructor() {

  //   effect(() => {
  //     console.log('Effect:', this.userName());
  //     // console.log('Effect:', untracked(this.counter));

  //     untracked(() => {
  //       console.log('Effect untracked:', this.counter());
  //     })
  //   });
  // }

  //untracked function  

  userName = signal('Amir');
  toggleUserName(): void {
    // Amir => Ehap
    this.userName.update((v) => (v === 'Amir' ? 'Ehap' : 'Amir'));
  }

  counter = signal(1);
  increaseCounter(): void {
    this.counter.update((v) => v + 1);
  }
  //async operation Break Reactive Context
  // constructor() {
  //   // effect => Reactive Context , async operation Break Reactive Context
  //   effect(async () => {
  //     const status = this.isDataVisible();
  //     const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
  //     const data = await response.json();
  //     if (status) {
  //       console.log(data);
  //     }
  //   });
  // }

  isDataVisible = signal(true);

  toggleDataVisibility() {
    this.isDataVisible.update((v) => !v);
  }

  // isSignal( arg ) => false , true 
  name = signal<string>("Mohamed Alaa Osman");
  age = 30;

  // constructor() {
  //   this.print(this.name);
  //   this.print(this.age);
  // }

  print(data: any): void {
    //signal scope
    if (isSignal(data)) {
      console.log("signal scope : ", data());
    } else {
      // value scope
      console.log("value scope : ", data);
    }
  }

  //isWritableSignal( signal ) => true, false  
  count2 = signal(10);
  doubleCount2 = computed(() => this.count2() * 2);

  resetSignal(signal: any): void {
    if (isWritableSignal(signal)) {
      signal.set(0);
    }
    else {
      alert("signal is not writable");
    }
  }


  //linkedSignal() => we can use set method

  employess = signal(['Osama', 'Ahmed', 'Mohamed']);
  selectedEmployee = linkedSignal(() => this.employess()[0]);

  selectedManger(index: number): void {
    this.selectedEmployee.set(this.employess()[index]);
  }

  replaceEmployees() {
    this.employess.set(["Kareem", "Yousse", "Omar"]);
  }

  //linkedSignal() based on source + computation
  flag = signal(true);
  data = signal([1, 2, 3]);

  selectedValue = linkedSignal({
    source: this.data,
    computation: (currrentSource, prev) => {
      //prev => previous source value {source,value}
      //currrentSource => current source value

      console.log("currentSource ", currrentSource);
      console.log("prev Value :", prev?.value);
      console.log("prev Source :", prev?.source);

      return currrentSource[0];
    }
  });


  toggleData() {
    if (this.flag()) {
      this.data.set([4, 5, 6]);
    } else {
      this.data.set([1, 2, 3]);
    }

    this.flag.update((v) => !v);
    console.log("New Data is", this.data());
  }

  products = signal<IProduct[]>([
    { id: 1, name: "Apple" },
    { id: 2, name: "Banana" },
    { id: 3, name: "Orange" },
  ]);

  selectedProduct = linkedSignal<IProduct[], IProduct>({
    source: this.products,
    computation: (currrentSource, prev) => {
      const prevId = prev?.value.id;
      const prevProduct = this.products().find(p => p.id === prevId);

      return prevProduct ?? currrentSource[0];
    }
  });

  onChange(id: number) {
    const product = this.products().find(p => p.id === id);
    if (product) {
      this.selectedProduct.set(product);
    }
  }

  refershData() {
    this.products.set([
      { id: 1, name: "Mango" },
      { id: 22, name: "PineApple" },
      { id: 3, name: "Orange" },
    ]);
  }

  //  Custom equality comparison in linkedSignal()
  constructor() {
    effect(() => {
      console.log("currentMnager", this.currentMnager());
    })
  }
  manger = signal({ id: 1, name: "Mohamed" });
  // currentMnager = linkedSignal(() => this.manger(), {
  //   equal: (a, b) => a.id === b.id
  // });

  currentMnager = linkedSignal({
    source: this.manger,
    computation: (currrentSource) => currrentSource,
    equal: (a, b) => a.id === b.id
  });

  changeManger() {
    this.manger.set({ id: 1, name: "Mohamed" });
  }

}
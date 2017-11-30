import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IOrder } from '../shared/interfaces'

@Injectable()
export class OrderService {
  public orders: IOrder[] = null;
  public orders$: BehaviorSubject<IOrder[]> = new BehaviorSubject<IOrder[]>(null);

  constructor() { }

  setOrders(orders: IOrder[]): void {
    this.orders = orders;
    this.orders$.next(orders);
  }

  getOrders(): Observable<IOrder[]> {
    return this.orders$.asObservable();
  }
}

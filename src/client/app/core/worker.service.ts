import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class WorkerService {
  public workers;
  public workers$: BehaviorSubject<any> = new BehaviorSubject<any>('');

  constructor() {
    console.log('WorkerService works');
  }

  public setWorkers(workers): void {
    this.workers = workers;
    this.workers$.next(workers);
  }

  public getWorkers(): Observable<any> {
    return this.workers$.asObservable();
  }
}

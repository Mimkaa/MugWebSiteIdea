import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeveloperModeService {
  private developerModeSubject = new BehaviorSubject<boolean>(false);
  developerMode$ = this.developerModeSubject.asObservable();

  toggleDeveloperMode(): void {
    this.developerModeSubject.next(!this.developerModeSubject.value);
  }

  setDeveloperMode(isOn: boolean): void {
    this.developerModeSubject.next(isOn);
  }

  getDeveloperMode(): boolean {
    return this.developerModeSubject.value;
  }
}

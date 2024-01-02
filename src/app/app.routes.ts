import { Routes } from '@angular/router';
import { FormStepperComponent } from './form-stepper/form-stepper.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'form-stepper',
        pathMatch: 'full'
    },
    {
        path: 'form-stepper',
        component: FormStepperComponent
    }
];

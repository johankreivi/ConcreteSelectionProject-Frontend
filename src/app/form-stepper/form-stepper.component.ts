import { Component, OnInit } from '@angular/core';
import { StepService } from '../step.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { NgForOf, NgIf, CommonModule } from '@angular/common';

@Component({selector: 'form-stepper',
standalone: true,
imports: [
  CommonModule,
  ReactiveFormsModule, 
  MatStepperModule, 
  MatButtonModule,
  NgIf,
  NgForOf,
  // Any other components or directives used in your template
],
templateUrl: './form-stepper.component.html',
styleUrls: ['./form-stepper.component.css'],
providers: [StepService, FormBuilder]
})
export class FormStepperComponent implements OnInit {
  currentData: string[] = [];
  steps: any[] = [];
  firstFormGroup!: FormGroup;
  stepper!: MatStepper;
  isLinear = false;
  selectionPath: any[] = []; // Tracks the user's selections to determine the current step options

  constructor(private stepService: StepService, private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.stepService.getTreeData().subscribe(data => {
      // Initialize the first step with level 1 objects as options
      this.steps.push({
        options: Object.keys(data).map(key => ({label: key, data: data[key]})),
        selectedOption: null // Track the selected option for each step
      });
    });
  }

  goToStepByBreadcrumb(crumb: string) {
    const crumbIndex = this.currentData.indexOf(crumb);
    if (crumbIndex !== -1) {
      this.currentData = this.currentData.slice(0, crumbIndex + 1);
      this.generateStepsFromPath();

      // Optional: Directly setting stepper's index might not always sync with dynamic step content
      // this.stepper.selectedIndex = someIndexBasedOnCrumb; // Needs logic to determine correct index
    }
  }
    

    processData(data: any, parentKey: string | null = null) {
      if (data === null) return;
    
      Object.keys(data).forEach(key => {
        const step = {
          label: key,
          children: data[key] instanceof Array ? data[key] : []
        };
    
        if (!parentKey) {
          this.steps.push(step);
        } else {
          const parentStep = this.steps.find(s => s.label === parentKey);
          if (parentStep) {
            if (!Array.isArray(parentStep.children)) {
              parentStep.children = []; // Ensure children is always an array
            }
            parentStep.children.push(step);
          }
        }
    
        this.processData(data[key], key);
      });
    }
    
    
    

    goToStep(choice: string) {
      this.currentData.push(choice); // Append the new choice to the path
      this.generateStepsFromPath(); // Re-generate steps based on the updated path
  }

  generateStepsFromPath() {
    this.stepService.getTreeData().subscribe(data => {
      let currentLevelData = data;
      // Navigate through the data based on currentData to find the current level
      for (const choice of this.currentData) {
        if (currentLevelData && currentLevelData[choice] && currentLevelData[choice].children) {
          currentLevelData = currentLevelData[choice].children;
        } else {
          currentLevelData = null;
          break;
        }
      }

      // Clear existing steps beyond the first one and repopulate based on currentLevelData
      this.steps.length = 1; // Keep the first step always
      if (currentLevelData) {
        // Assuming currentLevelData is now at the correct level to generate next steps
        const nextStepOptions = Object.keys(currentLevelData).map(key => ({
          label: key,
          data: currentLevelData[key]
        }));

        // If there are options for the next step, add them as a new step
        if (nextStepOptions.length > 0) {
          this.steps.push({
            options: nextStepOptions,
            selectedOption: null // No option selected yet for this new step
          });
        }
      }
    });
  }


  goBack() {
    if (this.currentData.length > 0) {
        this.currentData.pop(); // Remove the last choice
        this.generateStepsFromPath(); // Regenerate steps
    }
  }

  selectOption(stepIndex: number, option: any) {
    const currentStep = this.steps[stepIndex];
    currentStep.selectedOption = option.label; // Update the selected option for the current step
    this.currentData[stepIndex] = option.label; // Update the path with the selected option

    // Trim any steps beyond the current one since a new selection has been made
    this.steps = this.steps.slice(0, stepIndex + 1);

    // If the selected option has children, add a new step with these children as options
    if (option.data && Object.keys(option.data).length) {
      this.steps.push({
        options: Object.keys(option.data).map(key => ({label: key, data: option.data[key]})),
        selectedOption: null
      });
    }
  }
}


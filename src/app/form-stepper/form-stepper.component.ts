import { Component, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { StepService } from '../step.service';
import { MatStepperModule } from '@angular/material/stepper';
import { CommonModule } from '@angular/common';

interface StepNode {
  id?: string;
  label?: string;
  children?: StepNode[];
  completed?: boolean;
  choices?: (StepNode)[]
}

@Component({
  selector: 'app-form-stepper',
  templateUrl: './form-stepper.component.html',
  styleUrl: './form-stepper.component.css',
  standalone: true,
  providers: [StepService],
  imports: [MatStepperModule, CommonModule]
})
export class FormStepperComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;

  steps: StepNode[]; // Define a structured type for better type checking
  jsonStructure: StepNode; // The JSON structure you'll receive for the stepper
  currentPath: StepNode[] = []; // To maintain a history of choices
  rootNode: StepNode = {}; // The root node of the JSON structure


  constructor(private stepService: StepService) {
    this.steps = [];
    this.jsonStructure = {};
    this.stepService = stepService;
    this.stepper = {} as MatStepper;
  }

  ngOnInit() {
    this.stepService.getSteps().subscribe({
      next: (data: StepNode) => {
        this.jsonStructure = data; // Assign the fetched data to your component's property
        this.parseJsonToSteps(data); // Parse the fetched data into steps
        console.log(this.steps); // Log the steps after they have been parsed
      },
      error: (error) => {
        // Handle error scenario (for example, if the API call fails)
        console.error("Failed to load steps", error);
      }
    });
  }

  parseJsonToSteps(node: StepNode, accumulatedLabels: string[] = []) {
    console.log(node);
  
    const localAccumulatedLabels = [...accumulatedLabels];
  
    if (node.label) {
      localAccumulatedLabels.push(node.label);
    }
  
    // Determine the number of children
    const childCount = node.children ? node.children.length : 0;
  
    if (childCount === 0) {
      // Leaf node. Push the accumulated path as a step.
      this.steps.push({
        id: node.id,
        label: localAccumulatedLabels.join(' > '),
        completed: node.completed ?? false
      });
    } else if (childCount === 1) {
      // Single child. Continue the path without creating a new step.
      if (node.children) {
        this.parseJsonToSteps(node.children[0], localAccumulatedLabels);
      }
    } else {
      // Multiple children. This is a significant choice point.
      // First, push the current path up to this point as a choice step.

      this.steps.push({
        id: node.id,
        label: localAccumulatedLabels.join(' > '),
        completed: node.completed ?? false,
        choices: node.children?.map(child => {
          return {
            id: child.id,
            label: child.label,
            completed: child.completed ?? false,
            children: child.children,
            choices: child.choices
          }
        })
      });
  
      // Then, process each child as a new path from this choice point.
      node.children?.forEach(child => {
        this.parseJsonToSteps(child, [localAccumulatedLabels[localAccumulatedLabels.length - 1]]);
      });
    }
  }
  
  

  goToStep(choice: StepNode) {
    // Update the current path with the new choice
    this.currentPath.push(choice);

    // Regenerate steps based on the new path
    this.generateStepsFromPath();
  }

  generateStepsFromPath() {
    // Clear existing steps
    this.steps = [];

    // Start from the root or the last known point in the path
    let currentNode = this.rootNode; // Assume rootNode is your JSON structure's root
    for (const pathNode of this.currentPath) {
      let found = currentNode.children?.find(child => child.id === pathNode.id);
      if (found) {
        currentNode = found;
      } else {
        console.error("Path not found"); // Handle errors appropriately
        break;
      }
    }

    // Now currentNode is the last node in the path
    // Generate steps from here
    this.parseJsonToSteps(currentNode);
  }

  goBack() {
    // Remove the last choice from the current path, if there is one
    if (this.currentPath.length > 0) {
      this.currentPath.pop();
    }
  
    // Regenerate steps based on the new (shortened) path
    this.generateStepsFromPath();
  }

  canGoBack() {
    // Users can go back if there's more than one step in the path
    return this.currentPath.length > 1;
  }

  nextStep() {
    this.stepper.next();
  }

  previousStep() {
    this.stepper.previous();
  }
}

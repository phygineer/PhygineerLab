import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterLink,NgFor],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  apps:App[]=[]
  constructor(){

  }
  ngOnInit(){
    this.fetchApps();
  }
  private async fetchApps() {
    try {
      const response = await fetch('/assets/apps.json'); // Path to apps.json in public folder

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.apps = await response.json() as App[]; 

    } catch (error) {
      console.error('Error fetching apps:', error);
      // Handle error, e.g., display a message to the user
    }
  }
}

interface App {
  name: string;
  image: string;
  link: string;
  description: string;
}

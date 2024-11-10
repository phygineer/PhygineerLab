import { Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { ImageDetectionComponent } from './components/image-detection/image-detection.component';

export const routes: Routes = [
    { path: '', component: MainComponent },
    { path: 'image-detection', component: ImageDetectionComponent }
];

import { Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { ImageDetectionComponent } from './components/image-detection/image-detection.component';
import { AudioTranscribeComponent } from './components/audio-transcribe/audio-transcribe.component';
import { LlmChatComponent } from './components/llm-chat/llm-chat.component';

export const routes: Routes = [
    { path: '', component: MainComponent },
    { path: 'image-detection', component: ImageDetectionComponent },
    { path: 'audio-transcribe', component: AudioTranscribeComponent },
    {path:'llm-chat', component:LlmChatComponent}
];

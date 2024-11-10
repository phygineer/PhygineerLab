import { Component, NgModule } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormsModule, NgModel } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-audio-transcribe',
  standalone: true,
  imports: [FormsModule,NgIf],
  templateUrl: './audio-transcribe.component.html',
  styleUrl: './audio-transcribe.component.scss'
})

export class AudioTranscribeComponent {
  transcribedText: string | null = null;
  inputText: string = '';
  audioUrl: string | null = null;
  selectedFile: File | null = null;
  isSpeechToTextLoading=false
  isTextToSpeechLoading=false
  constructor(private apiService:ApiService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSpeechToText(event: Event): void {
    event.preventDefault();
    if (this.selectedFile) {
      this.isSpeechToTextLoading=true
      const formData = new FormData();
      formData.append('audio_file', this.selectedFile);

      this.apiService.onSpeechToText(formData).subscribe(
        data=>{
          this.transcribedText = data.transcribed_text
          this.isSpeechToTextLoading=false
        }
      )
    }
  }

  onTextToSpeech(event: Event): void {
    event.preventDefault();
    if (this.inputText.trim()) {
      this.isTextToSpeechLoading=true
      const formData = new FormData();
      formData.append('input_text', this.inputText);

      this.apiService.onTextToSpeech(formData).subscribe(
        data=>{
          const blob = new Blob([data], { type: 'audio/mpeg' });
          this.audioUrl = URL.createObjectURL(blob);
          this.isTextToSpeechLoading=false
        }
      )
      
    }
  }
}
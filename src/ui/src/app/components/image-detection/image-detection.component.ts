import { Component, ElementRef, ViewChild } from '@angular/core';
import { CaptionGenerationPayload, LlamaResponse, OllamaService } from '../../services/ollama.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ApiService, ImageResponse } from '../../services/api.service';

@Component({
  selector: 'app-image-detection',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './image-detection.component.html',
  styleUrl: './image-detection.component.scss'
})
export class ImageDetectionComponent {

  @ViewChild('imageInput') imageInput!: ElementRef;
  @ViewChild('modelInput') modelInputInput!: ElementRef;

  isLoading = false

  base64Data = '';

  captions = '';
  base64DetectedData = ''
  objects = ""
  constructor(private ollamaService: OllamaService, private apiService: ApiService) {
  }

  convertImage(): Promise<string> {
    const file: File | undefined = this.imageInput.nativeElement.files[0];

    if (file) {
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = (e) => {
          // Extract base64 string without prefix
          const base64Data = e.target!.result?.toString().split(',')[1] as string;
          resolve(base64Data);
        };

        reader.onerror = (err) => {
          reject(err);
        };

        reader.readAsDataURL(file);
      });

    } else {
      console.log('No image selected!');
      return new Promise<string>((resolve) => {
        resolve(''); // Resolve with an empty string
      });
    }
  }

  reset() {
    this.captions = ""
    this.base64DetectedData = ""
    this.isLoading = true
  }

  generate_caption() {
    this.reset()

    const file: File = this.imageInput.nativeElement.files[0]
    
    const model = (this.modelInputInput.nativeElement as HTMLSelectElement).value

    this.apiService.convert_img_to_b64(file).subscribe({
      next: (base64Image) => {

        const payload: CaptionGenerationPayload = {
          model: model,
          prompt: 'What is in this picture?',
          stream: false,
          images: [(base64Image as ImageResponse).image] // Use the base64 image data
        };

        this.ollamaService.generate_caption(payload).subscribe(
          {
            next: (v) => {
              this.captions = (v as LlamaResponse).response
            },
            error: (e) => {
              console.log(e);
            },
            complete: () => {
              console.info('caption generation complete.')
              this.isLoading = false
            }
          }
        )


      },
      error: (e) => console.log(e),
      complete: () => console.info('image to base64 convert complete.')
    }
    )
  }

  detect_objects() {
    this.reset()
    const file: File = this.imageInput.nativeElement.files[0]

    this.apiService.convert_img_to_b64(file).subscribe({
      next: (base64Image) => {

        this.apiService.detect_image((base64Image as ImageResponse).image).subscribe(
          {
            next: (v) => {
              this.base64DetectedData = `data:image/png;base64,${(v as ImageResponse).image}`
              this.isLoading = false;
            },
            error: (e) => {
              console.log(e);
            },
            complete: () => {
              console.info('image detection complete')
            }
          }
        )
      },
      error: (e) => console.log(e),
      complete: () => console.info('image to base64 convert complete.')
    }
    )
  }

  fetch_objects() {
    if (!this.objects) {
      this.apiService.get_detectable_objects().subscribe(objects => {
        this.objects = Object.values(objects).join(', ');
      })
    }
  }

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OllamaService {

  host="http://localhost:11434"
  constructor(private httpClient:HttpClient) { }

  get_models(){
    return this.httpClient.get(`${this.host}/api/tags`)
  }
  
  generate_caption(payload:CaptionGenerationPayload){
    return this.httpClient.post(`${this.host}/api/generate`,payload)
  }
}

export interface CaptionGenerationPayload {
  model: string; 
  prompt: string; 
  stream: boolean;
  images: string[];
}
export interface LlamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  done_reason: string;
  context: number[];
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

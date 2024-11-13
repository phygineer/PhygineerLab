import { Component } from '@angular/core';
import { OllamaService } from '../../services/ollama.service';
import { NgClass, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-llm-chat',
  standalone: true,
  imports: [NgFor, NgClass, FormsModule],
  templateUrl: './llm-chat.component.html',
  styleUrl: './llm-chat.component.scss'
})
export class LlmChatComponent {
  userMessage: string = '';
  chatHistory: { message: string, isUser: boolean }[] = [];
  constructor(private ollamaService: OllamaService) {}

  sendMessage(event?: Event) {
    // Prevent the form from submitting on Enter
    if (event) {
      event.preventDefault();
    }

    if (this.userMessage.trim()) {
      let message=this.userMessage;
      this.chatHistory.push({
        message: this.userMessage,
        isUser: true
      });
      this.userMessage = ''; // Clear the input after sending
      this.ollamaService.getResponse(message).subscribe(response => {
        this.chatHistory.push({ message: response.message.content, isUser: false });
        this.userMessage = '';
      });
    }
  }

  newLine(event: Event) {
    // Prevent the default behavior of Enter if Shift is pressed
    event.preventDefault();
    this.userMessage += '\n'; // Add a new line to the textarea
  }
}
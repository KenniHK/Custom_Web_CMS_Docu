import { Component, effect, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarkdownPreviewComponent } from '../markdown-preview/markdown-preview.component';
import path from 'path';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, MarkdownPreviewComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent {
  repo = 'docusaurus_CMS';
  files = signal<{name: string; path: string}[]>([]);
  selectedFilePath = signal<string | null>(null);
  markdownSignal = signal('');

  get markdownContent() {
    return this.markdownSignal();
  }
  set markdownContent(val: string) {
    this.markdownSignal.set(val);
  }

  status = signal('');


  constructor(private http: HttpClient) {
    this.loadFiles();
    effect(() => {
      if (this.selectedFilePath()) {
        this.loadFile(this.selectedFilePath()!);
      }
    });
  }

  loadFiles() {
    this.http.get<any[]>(`http://localhost:3001/docs?repo=${this.repo}`).subscribe(data => {
      this.files.set(data);
    });
  }

  loadFile(path: string) {
    this.http.get(`http://localhost:3001/file?repo=${this.repo}&path=${path}`, { responseType: 'text'})
    .subscribe(content => {
      this.markdownSignal.set(content);
    });
  }

  saveFile() {
    const body = {
      repo: this.repo,
      path: this.selectedFilePath(),
      content: this.markdownSignal(),
      message: 'Update via CMS'
    }

    this.http.post('http://localhost:3001/file', body).subscribe({
      next: (res: any) => this.status.set(`Disimpan: ${res.commit}`),
      error: err => this.status.set(`Error: ${err.message}`)
    });

  }
}

import { Component, OnInit } from '@angular/core';
import { CmsService } from '../services/cms.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-editor',
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent implements OnInit {
  content: string = '';
  path: string = '';

  constructor(private cms: CmsService) {}

  ngOnInit(): void {
    const filePath = localStorage.getItem('selectedFile') || '';
    this.path = filePath;
    this.cms.getDoc(filePath).subscribe(data => {
      this.content = data;
    })
  }

  save() {
    this.cms.saveDoc(this.path, this.content).subscribe(() => {
      alert('File berhasil disimpan!')
    })
  }
}

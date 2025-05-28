//Multi token input 
import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarkdownPreviewComponent } from '../markdown-preview/markdown-preview.component';
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, MarkdownPreviewComponent, CommonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent {
  token = signal('');
  owner = signal('');
  repoList = signal<{ name: string, path: string}[]>([]);
  selectedRepo = signal('');
  filesList = signal<{name: string; path: string}[]>([]);
  selectedFile = signal('');
  markdownContent = signal('');
  status = signal('');

  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('markdownArea') markdownArea!: ElementRef<HTMLTextAreaElement>;

  triggerImageInput() {
    this.imageInput.nativeElement.click();
  }

  handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('owner', this.owner());
    formData.append('repo', this.selectedRepo());
    formData.append('token', this.token());

    console.log('Mengubah gambar...');

    this.http.post<{url: string}>('http://localhost:3001/upload-image', formData).subscribe({
      next: (res) => {
        const markdown = `![${file.name}](${res.url})`;

        const textarea = this.markdownArea.nativeElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = this.markdownContent().substring(0, start);
        const after = this.markdownContent().substring(end);
        this.markdownContent.set(before + markdown + after);

        Swal.fire({
          title: 'Success',
          text: 'Gambar berhasil diunggah dan disisipkan',
          icon: 'success',
          confirmButtonText: 'Done',
          confirmButtonColor: '#346beb'
        })

        input.value = '';
      },
      error: err => {
        console.error(err);

        Swal.fire({
          title: 'Gagal Upload Gambar',
          text: (`${err.message}`),
          icon: 'error',
          confirmButtonText: 'Done',
          confirmButtonColor: '#346beb'
        })

      }
    })
  }

  constructor(private http: HttpClient) {}

  loadRepos() {
    const ownerVal = this.owner();
    const tokenVal = this.token();

    if (!ownerVal || !tokenVal) {
      Swal.fire({
        title: 'Error',
        text: 'Token dan Username harus diisi',
        icon: 'error',
        confirmButtonText: 'Done',
        confirmButtonColor: '#346beb'
      })
      return
    }

    this.http.get<any[]>(`http://localhost:3001/repos?owner=${this.owner()}&token=${this.token()}`).subscribe({
      next: data => this.repoList.set(data),
      error(err: any) {
        Swal.fire({
          title: 'Gagal ambil repositori',
          text: (`${err.message}`),
          icon: 'error',
          confirmButtonText: 'Done',
          confirmButtonColor: '#346beb'
        })
        return
      },
    });
  }

  loadFiles() {
    this.http.get<any[]>(`http://localhost:3001/docs?owner=${this.owner()}&repo=${this.selectedRepo()}&token=${this.token()}`).subscribe({
      next: data => this.filesList.set(data),
      error(err: any) {
        Swal.fire({
          title: 'Gagal ambil File',
          text: (`${err.message}`),
          icon: 'error',
          confirmButtonText: 'Done',
          confirmButtonColor: '#346beb'
        })
        return
      },
    });
  }

  loadFileContent() {
    this.http.get(`http://localhost:3001/file?owner=${this.owner()}&repo=${this.selectedRepo()}&path=${this.selectedFile()}&token=${this.token()}`, { responseType: 'text'}).subscribe({
      next: content => this.markdownContent.set(content),
      error: err => this.status.set(`Gagal ambil konten: ${err.message}`)
    });
  }

  saveFile() {
    const body = {
      token: this.token(),
      owner: this.owner(),
      repo: this.selectedRepo(),
      path: this.selectedFile(),
      content: this.markdownContent(),
      message: `Update via CMS By : ${this.owner}`
    }

    this.http.post('http://localhost:3001/file', body).subscribe({
      next(res: any) {
        Swal.fire({
          title: 'Success',
          text: (`Perubahan Berhasil di commit : ${res.commit}`),
          icon: 'success',
          confirmButtonText: 'Done',
          confirmButtonColor: '#346beb'
        })
        return
      },
      error(err: any) {
        Swal.fire({
          title: 'Perubahan gagal di commit',
          text: (`${err.message}`),
          icon: 'error',
          confirmButtonText: 'Done',
          confirmButtonColor: '#346beb'
        })
        return
      },
    });
  }

  // onImageSelected(event: Event){
  //   const file = (event.target as HTMLInputElement)?.files?.[0];
  //   if (!file) return;

  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     const base64Content = (reader.result as string).split(',')[1];
  //     const imagePath = `static/img/${file.name}`;
  //     const uploadBody = {
  //       token: this.token(),
  //       owner: this.owner(),
  //       repo: this.selectedRepo(),
  //       path: imagePath,
  //       content: base64Content,
  //       message: `Add image ${file.name}`
  //     };

  //     this.http.post('http://localhost:3001/file',uploadBody).subscribe({
  //       next: () => {
  //         const imageMarkdown = `![${file.name}](../../static/image/${file.name})`;
  //         this.markdownContent.set(this.markdownContent() + '\n' + imageMarkdown);
  //         Swal.fire('Sucess', 'Gambar diunggah dan disisipkan', 'success');
  //       },
  //       error: err => {
  //         Swal.fire('Error', `Upload gagal : ${err.message}`, 'error');
  //       }
  //     });
  //   };
  //   reader.readAsDataURL(file);
  // }

  // toogleImageUpload() {
  //   this.showImageUpload.set(!this.showImageUpload());
  // }
}

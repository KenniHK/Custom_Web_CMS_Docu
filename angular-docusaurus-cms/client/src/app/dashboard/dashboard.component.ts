// import { Component, effect, signal, computed } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { MarkdownPreviewComponent } from '../markdown-preview/markdown-preview.component';
// import path from 'path';

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [FormsModule, MarkdownPreviewComponent, CommonModule],
//   templateUrl: './dashboard.component.html',
//   styleUrl: './dashboard.component.css'
// })

// export class DashboardComponent {
//   repo = 'docusaurus_CMS';
//   files = signal<{name: string; path: string}[]>([]);
//   selectedFilePath = signal<string | null>(null);
//   markdownSignal = signal('');

//   get markdownContent() {
//     return this.markdownSignal();
//   }
//   set markdownContent(val: string) {
//     this.markdownSignal.set(val);
//   }

//   status = signal('');


//   constructor(private http: HttpClient) {
//     this.loadFiles();
//     effect(() => {
//       if (this.selectedFilePath()) {
//         this.loadFile(this.selectedFilePath()!);
//       }
//     });
//   }

//   loadFiles() {
//     this.http.get<any[]>(`http://localhost:3001/docs?repo=${this.repo}`).subscribe(data => {
//       this.files.set(data);
//     });
//   }

//   loadFile(path: string) {
//     this.http.get(`http://localhost:3001/file?repo=${this.repo}&path=${path}`, { responseType: 'text'})
//     .subscribe(content => {
//       this.markdownSignal.set(content);
//     });
//   }

//   saveFile() {
//     const body = {
//       repo: this.repo,
//       path: this.selectedFilePath(),
//       content: this.markdownSignal(),
//       message: 'Update via CMS'
//     }

//     this.http.post('http://localhost:3001/file', body).subscribe({
//       next: (res: any) => this.status.set(`Disimpan: ${res.commit}`),
//       error: err => this.status.set(`Error: ${err.message}`)
//     });

//   }
// }



//Multi token input 
import { Component, effect, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarkdownPreviewComponent } from '../markdown-preview/markdown-preview.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, MarkdownPreviewComponent, CommonModule],
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
      message: 'Update via CMS'
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
}

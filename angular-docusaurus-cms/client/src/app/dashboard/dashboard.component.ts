import { Component, OnInit } from '@angular/core';
import { CmsService } from '../services/cms.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent implements OnInit {
  projects: any[] = [];
  files: any[] = [];
  selectedProject: any = null;

  constructor(private cms: CmsService, private router: Router) {}

  ngOnInit(): void {
    this.cms.getProjects().subscribe((data: any) => {
      this.projects = data;
    })
  }

  loadDocs(projects: any) {
    this.selectedProject = projects;
    this.cms.getDocs(projects.path).subscribe((data: any) => {
      this.files = data;
    })
  }

  openFile(file: any) {
    localStorage.setItem('selectedFile', file.path);
    this.router.navigate(['/edit']);
  }
}

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, RESPONSE_INIT, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import type { ApiSuccess, Page } from '@placta/contracts';
import { PageRenderer } from '@placta/renderer';

// Change this to the public API origin for deployment; it must work in both browser and SSR.
const API = 'http://localhost:6969/api/v1';

@Component({
  selector: 'app-public-page',
  imports: [PageRenderer],
  template: `
    <header><a href="/">Home</a></header>
    <main>
      @if (page) { <cms-page-renderer [page]="page" /> }
      @else if (error) { <section role="alert"><h1>{{ error }}</h1></section> }
      @else { <p>Loading...</p> }
    </main>`,
  styles: [`header { padding:1rem 1.5rem; border-bottom:1px solid #ddd; } main { min-height:70vh; } section { padding:3rem 1.5rem; }`],
})
export class PublicPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly response = inject(RESPONSE_INIT, { optional: true });
  page: Page | null = null;
  error = '';

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => this.http.get<ApiSuccess<Page>>(`${API}/public/pages`, {
        params: { slug: params.get('slug') ?? '/' },
      })),
    ).subscribe({
      next: result => {
        this.page = result.data;
        this.error = '';
        this.title.setTitle(result.data.seo?.title || result.data.title);
        this.meta.updateTag({ name: 'description', content: result.data.seo?.description || '' });
      },
      error: (err: HttpErrorResponse) => {
        this.page = null;
        this.error = err.status === 404 ? 'Page not found' : 'Website temporarily unavailable';
        this.title.setTitle(this.error);
        if (this.response) this.response.status = err.status === 404 ? 404 : 503;
      },
    });
  }
}

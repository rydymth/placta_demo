import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentType, type HeroComponent, type Page, type PageComponent, type PageDetailDto, type PageSummaryDto, type PasskeyDto, type RevisionDto, type RevisionMetaDto, type TextSectionComponent } from '@placta/contracts';
import { PageRenderer } from '@placta/renderer';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, PageRenderer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  readonly api = inject(ApiService);
  private readonly change = inject(ChangeDetectorRef);
  email = '';
  password = '';
  reauthPassword = '';
  passkeyName = '';
  error = '';
  notice = '';
  busy = false;
  pages: PageSummaryDto[] = [];
  selected: PageDetailDto | null = null;
  draft: Page | null = null;
  passkeys: PasskeyDto[] = [];
  revisions: RevisionMetaDto[] = [];
  revision: RevisionDto | null = null;
  newTitle = '';
  newSlug = '';

  ngOnInit(): void {
    this.busy = true;
    this.api.refresh().then(() => this.loadPages()).catch(err => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) this.error = this.message(err);
    }).finally(() => { this.busy = false; this.change.markForCheck(); });
  }

  private message(err: unknown): string {
    if (err instanceof HttpErrorResponse) return err.error?.error?.message || `Request failed (${err.status || 'network error'})`;
    return err instanceof Error ? err.message : 'Something went wrong';
  }

  async run(action: () => Promise<void>): Promise<void> {
    this.error = '';
    this.notice = '';
    this.busy = true;
    try { await action(); }
    catch (err) { this.error = this.message(err); }
    finally { this.busy = false; this.change.markForCheck(); }
  }

  async loadPages(): Promise<void> {
    this.pages = await this.api.request<PageSummaryDto[]>('GET', '/admin/pages');
  }
  async loadPasskeys(): Promise<void> {
    this.passkeys = await this.api.request<PasskeyDto[]>('GET', '/admin/passkeys');
  }
  async loadRevisions(): Promise<void> {
    if (this.selected) this.revisions = await this.api.request<RevisionMetaDto[]>('GET', `/admin/pages/${this.selected.id}/revisions`);
  }
  async login(): Promise<void> {
    await this.run(async () => { await this.api.login(this.email, this.password); this.password = ''; await this.loadPages(); });
  }
  async loginPasskey(): Promise<void> {
    await this.run(async () => { await this.api.loginPasskey(); await this.loadPages(); });
  }
  async logout(): Promise<void> {
    await this.run(async () => { await this.api.logout(); this.pages = []; this.selected = null; this.draft = null; });
  }
  async open(id: string): Promise<void> {
    await this.run(async () => {
      this.selected = await this.api.request<PageDetailDto>('GET', `/admin/pages/${id}`);
      this.draft = structuredClone(this.selected.draft);
      this.revision = null;
      await this.loadRevisions();
    });
  }
  async create(): Promise<void> {
    await this.run(async () => {
      const page: Page = { schemaVersion: 1, title: this.newTitle.trim(), slug: this.newSlug.trim(), components: [] };
      this.selected = await this.api.request<PageDetailDto>('POST', '/admin/pages', page);
      this.draft = structuredClone(this.selected.draft);
      this.newTitle = ''; this.newSlug = ''; this.revisions = []; this.revision = null;
      await this.loadPages();
      this.notice = 'Page created as a draft.';
    });
  }
  async save(): Promise<void> {
    await this.run(async () => {
      if (!this.selected || !this.draft) return;
      this.selected = await this.api.request<PageDetailDto>('PUT', `/admin/pages/${this.selected.id}/draft`, this.draft);
      this.draft = structuredClone(this.selected.draft);
      await this.loadPages();
      this.notice = 'Draft saved. Publish to update the live website.';
    });
  }
  async publish(): Promise<void> {
    await this.run(async () => {
      if (!this.selected || !this.draft) return;
      this.selected = await this.api.request<PageDetailDto>('PUT', `/admin/pages/${this.selected.id}/draft`, this.draft);
      this.selected = await this.api.request<PageDetailDto>('POST', `/admin/pages/${this.selected.id}/publish`, {});
      this.draft = structuredClone(this.selected.draft);
      await this.loadPages(); await this.loadRevisions();
      this.notice = 'Page published.';
    });
  }
  async unpublish(): Promise<void> {
    await this.run(async () => {
      if (!this.selected) return;
      this.selected = await this.api.request<PageDetailDto>('POST', `/admin/pages/${this.selected.id}/unpublish`, {});
      await this.loadPages();
      this.notice = 'Page unpublished; revision history was retained.';
    });
  }
  async duplicate(): Promise<void> {
    await this.run(async () => {
      if (!this.selected) return;
      this.selected = await this.api.request<PageDetailDto>('POST', `/admin/pages/${this.selected.id}/duplicate`, {});
      this.draft = structuredClone(this.selected.draft);
      this.revisions = []; this.revision = null; await this.loadPages();
      this.notice = 'Page duplicated.';
    });
  }
  async remove(): Promise<void> {
    if (!this.selected || !window.confirm('Delete this page and its revision history?')) return;
    await this.run(async () => {
      await this.api.request('DELETE', `/admin/pages/${this.selected!.id}`);
      this.selected = null; this.draft = null; this.revisions = []; this.revision = null;
      await this.loadPages(); this.notice = 'Page deleted.';
    });
  }
  async viewRevision(id: string): Promise<void> {
    await this.run(async () => {
      if (this.selected) this.revision = await this.api.request<RevisionDto>('GET', `/admin/pages/${this.selected.id}/revisions/${id}`);
    });
  }
  async addPasskey(): Promise<void> {
    await this.run(async () => {
      await this.api.registerPasskey(this.reauthPassword, this.passkeyName);
      this.reauthPassword = ''; this.passkeyName = ''; await this.loadPasskeys(); this.notice = 'Passkey added.';
    });
  }
  async revokePasskey(id: string): Promise<void> {
    await this.run(async () => {
      await this.api.request('POST', `/admin/passkeys/${id}/revoke`, { password: this.reauthPassword });
      this.reauthPassword = ''; await this.loadPasskeys(); this.notice = 'Passkey removed.';
    });
  }
  add(type: 'hero' | 'text'): void {
    if (!this.draft) return;
    const id = crypto.randomUUID();
    this.draft.components.push(type === 'hero'
      ? { id, schemaVersion: 1, type: ContentType.hero, content: { heading: 'New heading' } }
      : { id, schemaVersion: 1, type: ContentType['text-section'], content: { heading: 'New section', body: 'Add text here.' } });
  }
  move(index: number, offset: number): void {
    if (!this.draft) return;
    const target = index + offset;
    if (target < 0 || target >= this.draft.components.length) return;
    const [item] = this.draft.components.splice(index, 1);
    this.draft.components.splice(target, 0, item);
  }
  duplicateSection(index: number): void {
    if (!this.draft) return;
    const copy = structuredClone(this.draft.components[index]);
    copy.id = crypto.randomUUID();
    this.draft.components.splice(index + 1, 0, copy);
  }
  hero(section: PageComponent): HeroComponent | null { return section.type === ContentType.hero ? section : null; }
  text(section: PageComponent): TextSectionComponent | null { return section.type === ContentType['text-section'] ? section : null; }
  optionalHero(section: HeroComponent, key: 'subTitle' | 'ctaText' | 'ctaHref', value: string): void {
    if (value) section.content[key] = value; else delete section.content[key];
  }
}

import { NgComponentOutlet } from '@angular/common';
import { Component, Input, type Type } from '@angular/core';
import { ContentType, type HeroComponent, type Page, type TextSectionComponent } from '@placta/contracts';

@Component({
  selector: 'cms-hero',
  template: `
    <section class="hero">
      <h1>{{ data.content.heading }}</h1>
      @if (data.content.subTitle) { <p>{{ data.content.subTitle }}</p> }
      @if (data.content.ctaHref && data.content.ctaText) {
        <a [href]="data.content.ctaHref">{{ data.content.ctaText }}</a>
      }
    </section>`,
  styles: [`.hero { padding: 5rem 1.5rem; text-align:center; background:#edf2ff; } h1 { font-size:clamp(2rem,5vw,4rem); } a { display:inline-block; padding:.7rem 1rem; background:#224dcc; color:white; border-radius:.4rem; }`],
})
export class HeroRenderer {
  @Input({ required: true }) data!: HeroComponent;
}

@Component({
  selector: 'cms-text-section',
  template: `<section><h2>{{ data.content.heading }}</h2><p>{{ data.content.body }}</p></section>`,
  styles: [`section { max-width: 70rem; margin:auto; padding: 3rem 1.5rem; } p { white-space: pre-wrap; }`],
})
export class TextSectionRenderer {
  @Input({ required: true }) data!: TextSectionComponent;
}

const registry: Readonly<Record<string, Type<unknown>>> = {
  [ContentType.hero]: HeroRenderer,
  [ContentType['text-section']]: TextSectionRenderer,
};

@Component({
  selector: 'cms-page-renderer',
  imports: [NgComponentOutlet],
  template: `
    @for (section of page.components; track section.id) {
      @if (registry[section.type]; as component) {
        <ng-container *ngComponentOutlet="component; inputs: { data: section }" />
      } @else {
        <p>Unsupported section: {{ section.type }}</p>
      }
    }`,
})
export class PageRenderer {
  @Input({ required: true }) page!: Page;
  readonly registry = registry;
}

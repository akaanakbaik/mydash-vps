import type { NotificationTemplateEngine } from '../../domain/notification/services.js';
import type { NotificationTemplate } from '@mydash/shared';
import { DEFAULT_TEMPLATES } from '../../domain/notification/valueObjects.js';
export class NotificationTemplateEngineImpl implements NotificationTemplateEngine {
  render(template: NotificationTemplate, values: Record<string, string | number>): string {
    const header = this.replacePlaceholders(template.headerTemplate, values);
    const body = this.replacePlaceholders(template.bodyTemplate, values);
    const footer = this.replacePlaceholders(template.footerTemplate, values);
    return `${header}\n\n${body}\n\n${footer}`;
  }
  renderDefault(category: string, severity: string, values: Record<string, string | number>): string {
    const key = `${category}_${severity}`;
    const config = DEFAULT_TEMPLATES[key] ?? DEFAULT_TEMPLATES.cpu_warning;
    const header = this.replacePlaceholders(config.headerTemplate, values);
    const body = this.replacePlaceholders(config.bodyTemplate, values);
    const footer = this.replacePlaceholders(config.footerTemplate, values);
    return `${header}\n\n${body}\n\n${footer}`;
  }
  private replacePlaceholders(template: string, values: Record<string, string | number>): string {
    let result = template;
    for (const [key, value] of Object.entries(values)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }
    return result.replace(/\{[^}]+\}/g, '');
  }
}

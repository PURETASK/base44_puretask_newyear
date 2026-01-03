/**
 * Template Renderer - Replaces {{variables}} in template strings
 * Supports email, SMS, and push notification templates
 */

export function renderTemplate(template, variables) {
  if (!template) return '';
  
  let result = template;
  
  // Replace all {{variable}} placeholders
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key] || '');
  });
  
  return result;
}

export function renderEmailTemplate(template, variables) {
  return {
    subject: renderTemplate(template.subject, variables),
    html: renderTemplate(template.html_body, variables)
  };
}

export function renderSMSTemplate(template, variables) {
  return renderTemplate(template.sms_body, variables);
}

export function renderPushTemplate(template, variables) {
  return {
    title: renderTemplate(template.push_title, variables),
    body: renderTemplate(template.push_body, variables),
    deepLink: renderTemplate(template.deep_link, variables)
  };
}

export function validateVariables(template, providedVars) {
  const required = template.variables || [];
  const missing = required.filter(v => !providedVars.hasOwnProperty(v));
  
  return {
    valid: missing.length === 0,
    missing: missing
  };
}

export default {
  renderTemplate,
  renderEmailTemplate,
  renderSMSTemplate,
  renderPushTemplate,
  validateVariables
};
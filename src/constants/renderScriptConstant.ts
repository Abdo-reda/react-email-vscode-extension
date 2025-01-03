//TODO: fix the script
export const RENDER_EMAIL_SCRIPT = `
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const EmailComponent = require('./email');
const { render } = require('@react-email/render');
const { createElement } = require('react');
const emailElement = createElement(EmailComponent.default, EmailComponent.PreviewProps);
Promise.all([
  render(emailElement),
  render(emailElement, { plainText: true })
]).then(([html, text]) => {
  process.stdout.write(JSON.stringify({
    html: html,
    text: text,
  }));
}).catch(console.error);
`;

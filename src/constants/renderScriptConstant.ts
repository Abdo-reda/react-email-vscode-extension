export const RENDER_EMAIL_SCRIPT = `
const EmailComponent = require('./email');
const { render } = require('@react-email/render');
const { createElement } = require('react');

Promise.all([
  render(createElement(EmailComponent.default, EmailComponent.default?.PreviewProps)),
  render(createElement(EmailComponent.default, EmailComponent.default?.PreviewProps), { plainText: true })
]).then(([html, text]) => {
  process.stdout.write(JSON.stringify({
    html: html,
    text: text,
  }));
}).catch(console.error);
`;

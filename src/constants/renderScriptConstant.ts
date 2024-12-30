export const RENDER_EMAIL_SCRIPT = `
const EmailComponent = require('./email');
const { render } = require('@react-email/render');
const { createElement } = require('react');

async function generateEmail() {
  try {
    const [html, text] = await Promise.all([
      render(createElement(EmailComponent.default, EmailComponent.default?.PreviewProps)),
      render(createElement(EmailComponent.default, EmailComponent.default?.PreviewProps), { plainText: true })
    ]);

    process.stdout.write(JSON.stringify({
      html: html,
      text: text,
    }));
  } catch (error) {
    console.error(error);
  }
}

generateEmail();
`;

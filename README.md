![React Email Renderer Cover](https://github.com/Abdo-reda/react-email-vscode-extension/blob/main/assets/repo-cover.png?raw=true)

<div align="center"><strong>React Email Renderer</strong>  📧⚡</div>
<div align="center">A Visual Studio Code Extension for the React Email Package.</div>
<div align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=AbdoReda.react-email-renderer">Marketplace</a> 
  <span> · </span>
  <a href="https://github.com/Abdo-reda/react-email-vscode-extension">Github</a> 
  <span> · </span>
  <a href="https://react.email">React Email</a>
</div>

## Introduction

A plug & play solution to develop your react emails, shows a **live preview** without any need for any complex setup or configuration.

Instead of having to manually setup a starter project in order to view your react emails, this extension allows you to directly view/preview them in vscode. It **renders your emails behind the scenes automatically**. Allowing you to view changes in realtime, input props dynamically, view compiled code leading to faster workflows.

This is **NOT an official extension from React Email**, its more of a passion/learning project made by me `¯\_(ツ)_/¯`.

## Features

![Demo Video](https://github.com/Abdo-reda/react-email-vscode-extension/blob/version/v-0.7.0/assets/demo.gif?raw=true)

**List of Features:**
- Live preview with fast hmr utilizing the power of vite.
- Support for props.
- Additional tools including:
  - Inspecting generated html utilizing vscode dev tools.
  - Ability to Zoom in/out.
  - ... more to come

## Usage Notes

#### For Email Templates to be Rendered. They must abide by the following:

- The Emails must be written in **`.jsx` or `.tsx`** file extensions.
- The Email Component needs to be the **default export** of the active file.
- The Props object needs to be exported with the name **`PreviewProps`**.
  - Yes, this is unlike how react-email usually does it. I decided to make the PreviewProps object as a seperate export as it made handling things easier. _This might change in a future release_.

#### Sample Email

```tsx
import { Html } from "@react-email/components";
import * as React from "react";

interface EmailComponentProps {
  name: string;
}

export const EmailComponent = (props: EmailComponentProps) => {
  return <Html> Hello, {props.name} </Html>;
};

export default EmailComponent;

export const PreviewProps: EmailComponentProps = {
  name: "React Email",
};
```

## Why Though?

I recently used react email in one of my projects, and while using it I wished if there was a faster way I can preview my emails instead of having to manually setup a project. I was not the only person that had this idea and I was even more motivated when I found out there was an already existing discussion [on the same issue here](https://github.com/resend/react-email/discussions/574). so I decided to try and give it a shot. 

As mentioned, while solutions like [Preview.js](https://previewjs.com/) already exist. I faced some problems using it, also I felt it was quite a very generic solution which can be great sometimes but can also lead to heaviness. I believed a targeted solution will yield better results, this is what this extension represents. It solves a very niche and specific problem (only rendering react emails) but in doing so, I think it leads to faster and more consistent results.

## Requirements

- A working package manager [`npm`, `yarn`, `pnpm`] needs to be installed globally.

## Known Issues and Limitations

* Sometimes the preview panel does not refresh (blank screen). When that happens, simply click on the preview button again or run the preview command.
* `pnpm` and `yarn` were not tested...
* no support for `deno` or `bun` yet ...


## Extension Settings

#### General
* `renderApproach`: The Approach used to render the email. By default a `vite server` runs. A `script` approach will be added in a future release hopefully.

* `dependencies`: Which dependencies will be used to render the email. Currently, only `external` option is allowed. Later, a `local` option that uses the active project dependencies would be supported. 

* `runtimeEnviornment`: The Runtime Enviornment Used to execute scripts. Currently only `node` is supported. Later, support for deno, bun will be added.

* `packageManager`: The Package Manager Used to install and run Dependencies. By default `npm` is used.

* `renderOn`: When should the email be rerendered and updated. By default its `OnSave`.

#### Packages

* `packages.directory`: The path for the external project that will be used to render the email. By default the `extensionUri:` - The uri of the directory containing the extension - is used.

* `packages.reactEmailRenderVersion`: The [version](https://www.npmjs.com/package/@react-email/render?activeTab=versions) of `@react-email/render` used. 

* `packages.reactEmailComponentsVersion`: The [version](https://www.npmjs.com/package/@react-email/components?activeTab=versions) of `@react-email/components` used.

* `packages.reactVersion`: The [version](https://www.npmjs.com/package/react?activeTab=versions) of `react` used.

* `packages.reactDomVersion`: The [version](https://www.npmjs.com/package/react-dom?activeTab=versions) of `react-dom` used.

#### Server

* `server.port`: The Port that the Live Render Server will run on. Make sure that the port is not reserved, assigned or in use for the extension to work.

* `server.terminalVisible`: Controls the visiblity behaviour of the server terminal when rendering. By default its hidden. 

* `server.terminalColor`: The Color of the Render Server Terminal.


## Extension Commands

* `preview`: **Opens and Refreshes the Preview Panel** and starts the rendering process if there are valid emails to render.

* `selectPackageVersion`: **Opens A Quick Option Dialog** to select a valid package version for react email dependencies. 

* `toggleRenderTerminal`: **Shows and Hides The Terminal**, once the terminal is shown in the UI, it can't be hidden unless the entire terminal panel is hidden.

* `restartRenderProcess`: **Restarts the Rendering Processing**. will start the rendering process if not already started.

* `stopRenderProcess`: **Stops the Rendering Processing**. will stop the rendering process if it has started.

## Contributions

All contributions are open, and all feedback is more than welcome. If you like it, please reach out and tell me. If you face any issues, do the same!

**You can send me an [email](mailto:3bdo.reda@gmail.com), leave a [review](https://marketplace.visualstudio.com/items?itemName=AbdoReda.react-email-renderer&ssr=false#review-details), open an [issue](https://github.com/Abdo-reda/php-stan-vscode-extension/issues)!**

## Possible Enhancements

- [ ] Add support for deno. Make deno imports work (different import resolutions).
- [ ] Add support for Bun.
- [ ] Make sure that yarn, pnpm are working.
- [ ] Add support for script approach. 
- [ ] Maybe look into supporting multiple emails at once (storybook approach).
  - Will have to perform cleanup when the extension starts or disposes to delete any files in the emails folder if there is any.
- [ ] Add support for multiple projects with different dependencies (external projects) ... maybe a setting for multiple projects or a single project.
- [ ] Add support for using local dependencies instead of having to setup an external project.
- [ ] Add a custom viewer to input props (a view in the preview panel)

## LICENCE

[GNU GENERAL PUBLIC LICENSE](LICENSE)

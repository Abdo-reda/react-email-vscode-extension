# React Email Renderer
![LOGO](./assets/logo.png)

**React Email Renderer** is an extension for the React Email Package. Its suppose to be a plug & play extension, no need for any complex setup or configuration.

Instead of having to manually setup a starter project in order to view your react emails, this extension allows you to directly view/preview them in vscode. This extensions **renders your emails behind the scenes automatically**. 
View changes in realtime, input props dynamically, view compiled code. This in theory, should result in faster workflows. 

This is **NOT an official extension from React Email**, its more of a passion/learning project made by me because I was bored `¯\_(ツ)_/¯`.

## Features


//demo video here

## Usage Notes

#### For Email Templates to be Rendered. They must abide by the following:
- The Emails must be written in **`.jsx` or `.tsx`** file extensions.
- The Email Component needs to be the **default export** of the active file.
- The Props object needs to be exported with the name **`PreviewProps`**. 
    - Yes, this is unlike how react-email usually does it, including the PreviewProps object as a seperate export made handling things easier. _This might change in a future release_.

#### Sample Email
```tsx


export const PreviewProps: ExampleEmailProps = {
    name: "React User"
}

export default ExampleEmail;
```

## Why Though?


## Requirements

## Known Issues and Limitations

## Extension Settings

## Extension Commands

## Release Notes

## Possible Enhancements

- [ ] Make deno imports work (add support for deno and resolutions).
- [ ] Add support for Bun.
- [ ] Maybe look into supporting multiple emails at once (storybook approach).
    - Will have to perform cleanup when the extension starts or disposes to delete any files in the emails folder if there is any.
- [ ] Support multiple project with different dependencies (external projects) ... maybe a setting for multiple projects or a single project.

## LICENCE

[GNU GENERAL PUBLIC LICENSE](LICENSE)
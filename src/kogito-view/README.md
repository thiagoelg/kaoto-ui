# Custom View
This is a custom view for Kogito, divided into directories. It exposes an API very similar to the Kaoto [Step Extension](https://kaoto.io/docs/add-custom-view/) API. It's kept separate because in the near future these will likely diverge.

1. `api`
   - Provides the APIs that the Channel/Envelope expose to each other.
2. `embedded`
   - Provides a convenience React component to embed a 'To do' list View in a Web application. 
3. `envelope`
   - Provides the necessary class for a Channel to create a 'To do' list Envelope.
4. `vscode`
   - Provides a convenience class to create a Webview inside a VS Code Extension.



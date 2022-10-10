import { RefObject, createRef } from "react";

import {
  Editor,
  EditorApi,
  EditorInitArgs,
  EditorTheme,
  KogitoEditorEnvelopeContextType,
} from "@kie-tools-core/editor/dist/api";
import { DEFAULT_RECT } from "@kie-tools-core/guided-tour/dist/api";
import { Notification } from "@kie-tools-core/notifications/dist/api";
import { KaotoEditor } from "./KaotoEditor";
import { KaotoEditorChannelApi } from "./api";

export class KaotoEditorView implements Editor {
  private readonly editorRef: RefObject<EditorApi>;
  public af_isReact = true;
  public af_componentId!: "kaoto-editor";
  public af_componentTitle!: "Kaoto Editor";

  constructor(
    private readonly envelopeContext: KogitoEditorEnvelopeContextType<KaotoEditorChannelApi>,
    private readonly initArgs: EditorInitArgs
  ) {
    this.editorRef = createRef<EditorApi>();
  }

  public async getElementPosition() {
    return DEFAULT_RECT;
  }

  public setContent(path: string, content: string): Promise<void> {
    return this.editorRef.current!.setContent(path, content);
  }

  public getContent(): Promise<string> {
    return this.editorRef.current!.getContent();
  }

  public getPreview(): Promise<string | undefined> {
    return this.editorRef.current!.getPreview();
  }

  public af_componentRoot() {
    return (
      <KaotoEditor
        ref={this.editorRef}
        channelType={this.initArgs.channel}
        onReady={() => this.envelopeContext.channelApi.notifications.kogitoEditor_ready.send()}
        onNewEdit={(edit) => {
          this.envelopeContext.channelApi.notifications.kogitoWorkspace_newEdit.send(edit);
        }}
        setNotifications={(path, notifications) =>
          this.envelopeContext.channelApi.notifications.kogitoNotifications_setNotifications.send(path, notifications)
        }
        onStateControlCommandUpdate={(command) =>
          this.envelopeContext.channelApi.notifications.kogitoEditor_stateControlCommandUpdate.send(command)
        }
        channelApi={this.envelopeContext.channelApi}
      />
    );
  }

  public async undo(): Promise<void> {
    return this.editorRef.current!.undo();
  }

  public async redo(): Promise<void> {
    return this.editorRef.current!.redo();
  }

  public async validate(): Promise<Notification[]> {
    return this.editorRef.current!.validate();
  }

  public async setTheme(theme: EditorTheme) {
    return this.editorRef.current!.setTheme(theme);
  }
}

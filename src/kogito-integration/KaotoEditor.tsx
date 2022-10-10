import "./KaotoEditor.css";
import { Suspense, forwardRef, useState, useCallback, useImperativeHandle, useRef, useEffect } from "react";
import { HashRouter as Router } from "react-router-dom";
import { WorkspaceEdit } from "@kie-tools-core/workspace/dist/api";
import { Notification } from "@kie-tools-core/notifications/dist/api";
import { MessageBusClientApi } from "@kie-tools-core/envelope-bus/dist/api";
import { useSharedValue } from "@kie-tools-core/envelope-bus/dist/hooks";
import { ChannelType, EditorApi, StateControlCommand } from "@kie-tools-core/editor/dist/api";
import { AlertProvider, MASLoading, AppLayout } from "@kaoto/layout";
import { AppRoutes } from "@kaoto/routes";
import { KaotoIntegrationProviderRef, KogitoEditorIntegrationProvider, ContentOperation } from "./KogitoEditorIntegrationProvider";
import { KaotoEditorChannelApi } from "./api";
import { setApiUrl } from "@kaoto/api";

interface Props {
  /**
   * Delegation for KogitoEditorChannelApi.kogitoEditor_ready() to signal to the Channel
   * that the editor is ready.
   */
  onReady: () => void;

  /**
   * Delegation for KogitoEditorChannelApi.kogitoEditor_stateControlCommandUpdate(command) to signal to the Channel
   * that the editor is performing an undo/redo operation.
   */
  onStateControlCommandUpdate: (command: StateControlCommand) => void;

  /**
   * Delegation for WorkspaceChannelApi.kogitoWorkspace_newEdit(edit) to signal to the Channel
   * that a change has taken place.
   * @param edit An object representing the unique change.
   */
  onNewEdit: (edit: WorkspaceEdit) => void;

  /**
   * Delegation for NotificationsChannelApi.kogigotNotifications_setNotifications(path, notifications) to report all validation
   * notifications to the Channel that will replace existing notification for the path.
   * @param path The path that references the Notification
   * @param notifications List of Notifications
   */
  setNotifications: (path: string, notifications: Notification[]) => void;

  /**
   * ChannelType where the component is running.
   */
  channelType: ChannelType;

  /**
   * Channel API
   */
  channelApi: MessageBusClientApi<KaotoEditorChannelApi> 
}

export const KaotoEditor = forwardRef<EditorApi, Props>((props, forwardedRef) => {
  const [editorContent, setEditorContent] = useState<string | undefined>();
  const [contentPath, setContentPath] = useState<string | undefined>();
  const providerRef = useRef<KaotoIntegrationProviderRef>(null);

  /**
   * Callback is exposed to the Channel to retrieve the current value of the Editor. It returns the value of
   * the editorContent, which is the state that has the kaoto yaml.
   */
  const getContent = useCallback(() => {
    return editorContent || "";
  }, [editorContent]);


  /**
   * Callback is exposed to the Channel that is called when a new file is opened. It sets the originalContent to the received value.
   */
  const setContent = useCallback(
    (path: string, content: string) => {
      setEditorContent(content);
      setContentPath(path);
    },
    []
  );

  const onContentChanged = useCallback((newContent: string, operation: ContentOperation) => {
    setEditorContent(newContent);
    if (operation === ContentOperation.EDIT) {
      props.onNewEdit(new WorkspaceEdit(newContent));
    } else if (operation === ContentOperation.UNDO) {
      props.onStateControlCommandUpdate(StateControlCommand.UNDO);
    } else if (operation === ContentOperation.REDO) {
      props.onStateControlCommandUpdate(StateControlCommand.REDO);
    }
  }, [props]);

  /**
   * The useImperativeHandler gives the control of the Editor component to who has it's reference, making it possible to communicate with the Editor.
   * It returns all methods that are determined on the EditorApi.
   */
  useImperativeHandle(forwardedRef, () => {
    return {
      getContent: () => Promise.resolve(getContent()),
      setContent: (path: string, content: string) => Promise.resolve(setContent(path, content)),
      getPreview: () => Promise.resolve(undefined),
      undo: (): Promise<void> => {
        return providerRef.current?.undo() || Promise.resolve();
      },
      redo: (): Promise<void> => {
        return providerRef.current?.redo() || Promise.resolve();
      },
      getElementPosition: () => Promise.resolve(undefined),
      validate: () => Promise.resolve([]),
      setTheme: () => Promise.resolve(),
    };
  });

  const [settings] = useSharedValue(props.channelApi.shared.kogitoKaotoEditor__settings);

  useEffect(() => {
    settings?.apiUrl && setApiUrl(settings.apiUrl);
  }, [settings]);

  return (
    <>
      {editorContent !== undefined && contentPath !== undefined ? (
        <KogitoEditorIntegrationProvider
        content={editorContent}
        contentPath={contentPath}
        onContentChanged={onContentChanged}
        onReady={props.onReady}
        ref={providerRef}
      >
        <AlertProvider>
          <Router>
            <Suspense fallback={<MASLoading />}>
              <AppLayout>
                <AppRoutes />
              </AppLayout>
            </Suspense>
          </Router>
        </AlertProvider>
      </KogitoEditorIntegrationProvider>
      ) : <MASLoading />}
    </>
  );
});

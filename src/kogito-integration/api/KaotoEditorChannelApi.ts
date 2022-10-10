import { KogitoEditorChannelApi } from "@kie-tools-core/editor/dist/api";
import { SharedValueProvider } from "@kie-tools-core/envelope-bus/dist/api";

export interface KaotoSettings {
  apiUrl: string;
}

export interface KaotoEditorChannelApi extends KogitoEditorChannelApi {
  kogitoKaotoEditor__settings(): SharedValueProvider<KaotoSettings>;
}

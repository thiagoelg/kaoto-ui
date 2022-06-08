import { IStepProps } from '../../types';

/**
 * Public-facing API that exposes methods, allowing
 * the user to control the custom View component
 */
export interface IKaotoApi {
  fetchCatalogSteps: () => void;
  fetchCRDs: (newSteps: IStepProps[], integrationName: string) => void;
  fetchDeployments: () => void;
  fetchDSLs: () => void;
  fetchViewDefinitions: (data: string | IStepProps[]) => void;
  notifyKaoto: (title: string, body?: string, variant?: string) => void;
  startDeployment: (
    dsl: string,
    integration: any,
    integrationName: string,
    namespace: string
  ) => void;
  stopDeployment: (integrationName: string) => void;
}

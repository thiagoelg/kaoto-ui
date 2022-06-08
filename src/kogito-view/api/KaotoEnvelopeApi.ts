import { IStepProps } from '../../types';

/**
 * Methods provided by the Envelope that can be consumed by the Channel.
 */
export interface IKaotoEnvelopeApi {
  kaoto__fetchCatalogSteps: () => void;
  kaoto__fetchCRDs: (newSteps: IStepProps[], integrationName: string) => void;
  kaoto__fetchDeployments: () => void;
  kaoto__fetchDSLs: () => void;
  kaoto__fetchViewDefinitions: (data: string | IStepProps[]) => void;
  kaoto__notifyKaoto: (title: string, body?: string, variant?: string) => void;
  kaoto__startDeployment: (
    dsl: string,
    integration: any,
    integrationName: string,
    namespace: string
  ) => void;
  kaoto__stopDeployment: (integrationName: string) => void;
}

export interface IAssociation {
  origin: string;
  envelopeServerId: string;
}

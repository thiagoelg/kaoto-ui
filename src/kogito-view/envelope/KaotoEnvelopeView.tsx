import { IStepProps } from '../../types';
import { IKaotoChannelApi } from '../api';
import { MessageBusClientApi } from '@kie-tools-core/envelope-bus/dist/api';
import { forwardRef, useImperativeHandle, useState } from 'react';

export interface IKaotoEnvelopeViewApi {
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

interface Props {
  channelApi: MessageBusClientApi<IKaotoChannelApi>;
}

/**
 * The actual implementation of the Kaoto View.
 * In this case, it's a React component. See KaotoEnvelope.tsx.
 *
 * Provides an imperative handle to give control of this component to its containing components.
 */
export const KaotoEnvelopeView = forwardRef<IKaotoEnvelopeViewApi, Props>((props, forwardedRef) => {
  const deployments = useState([]);
  const steps = useState([]);

  useImperativeHandle(forwardedRef, () => ({
    fetchCatalogSteps,
    fetchCRDs,
    fetchDeployments,
    fetchDSLs,
    fetchViewDefinitions,
    notifyKaoto,
    startDeployment,
    stopDeployment,
  }));

  return (
    <div>
      <h1>Kaoto</h1>
      <p>Hello!</p>
    </div>
  );
});
